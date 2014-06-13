//$( document ).ready(function() {
$(function() {

	var inputList = fetchUserInput();

	var cafeList = [[]]; 

	$('#refresh').click(function() {
		inputList = fetchUserInput();
		//console.log(inputList);
		scoreCafes(cafeList, inputList);
		console.log(cafeList[0][0] + ":" + cafeList[0][3]);
		sortCafes(cafeList);
		var formattedOutput = createFormattedOutput(cafeList);
		$('#output').html(formattedOutput);
		var footerOutput = createFooterOutput(cafeList);
		$('#footer').html(footerOutput);
		//console.log(formattedOutput);
	});

	var req = new XMLHttpRequest();
	req.open('GET', 'https://sites.google.com/a/google.com/mv-cafes/', false); 
	req.send(null);

	var cafeLinks;

	if(req.status == 200) {
		resp = req.responseText;
		var parser = new DOMParser ();
		htmlDoc = parser.parseFromString(resp, "text/html");
		cafeLinks = htmlDoc.getElementsByClassName("sites-navigation-link");
	}

	var menuXHR = [];
	var j = 0;

	console.log("Total links to process:" + (cafeLinks.length - 4));

	for (var i = 0; i < cafeLinks.length - 4; i++) {  //skip non-MTV cafes (last 4). different content structure
		(function(i) {
			menuXHR[i] = new XMLHttpRequest();
			var cafeUrl = cafeLinks[i].href;
			menuXHR[i].open('GET', cafeUrl, true);
			console.log("looped to: " + i);

			menuXHR[i].onload = function (e) {
				console.log("loaded no. " + i + menuXHR[0]);
				if (menuXHR[i].readyState === 4) {
					console.log("ready no." + i);
					if(menuXHR[i].status === 200) {

						resp = menuXHR[i].responseText;
						var menuItems = parseCafeMenuPage(resp);
						cafeList[i] = [];
						cafeList[i].push(cafeLinks[i].text);
						cafeList[i].push(cafeUrl);

						//menuXHR.open('GET', cafeUrl, false);
						//console.log("sending request no." + i);

						cafeList[i].push(menuItems);
						//console.log("completed request no." + i);
					};
					//console.log("Pushed: no." + i);

					//console.log("Total so far: " + j);
					//when all pages are loaded (value of j matches length of array of pages - 1)
					if (j == cafeLinks.length - 4 - 1) {
							console.log("j=" + j + " | " + inputList);
							for (var x=0; x < cafeLinks.length -4; x++) {
								console.log("\n ******cafeList:" + x + " " + cafeList[x]);
							}
							scoreCafes(cafeList, inputList); // Score the cafes and dishes

							sortCafes(cafeList); // Sort the cafes by their scores

							var formattedOutput = createFormattedOutput(cafeList);

							$('#output').html(formattedOutput);

							var footerOutput = createFooterOutput(cafeList);
							$('#footer').html(footerOutput);
					}
					else j++;
				}
				else (console.log("readystate = " + menuXHR[i].readyState + " | status = " + menuXHR[i].status));
			};

			menuXHR[i].onerror = function (e) {
				console.error(menuXHR[i].statusText);
			};

			menuXHR[i].send();

		})(i);
	}

	//pre-scoring sample data
	//cafeList[0][0] : "BigTable";
	//cafeList[0][1] : "http://menu-mtv-bigtable.blogspot.com/";
	//cafeList[0][2][0][0] : name of first dish
	//cafeList[0][2][0][1] : ingredients of first dish


	//post-scoring sample data
	//cafeList[0][2][0][2]) : Dish score
	//cafeList[0][3]) : Cafe score

});

function fetchUserInput(){
	var likesInput = $("input.likes");
	var dislikesInput = $("input.Dislikes");

	var likeList = [];
	var dislikeList = [];

	for (var i=0; i<5; i++)
	{
		likeList[i] = [];
		dislikeList[i] = [];
		likeList[i].push(likesInput[i].value);
		likeList[i].push((6-i) * 2);
		dislikeList[i].push(dislikesInput[i].value);
		dislikeList[i].push((6-i) * -1);
	}

	var inputList = likeList.concat(dislikeList);
	return inputList;
}

function createFormattedOutput(cafeList){
	var formattedOutput = "";

	
	for (var i=0; i<5; i++){ //show the top 5 cafes
		formattedOutput += "<div>";
		formattedOutput += "<h5>";
		formattedOutput += "<a href='" + cafeList[i][1] + "' target='_blank'>" + cafeList[i][0] + "</a>";
		formattedOutput += " (Score: " + cafeList[i][3] + ")";
		formattedOutput += "</h5>";
		formattedOutput += "<strong>Top Dishes:</strong>";
		for (var j=0; j<3; j++){ //loop through the top 3 dishes
			formattedOutput += "<span title='" + cafeList[i][2][j][1] + "'>";
			formattedOutput += cafeList[i][2][j][0] + " (" + cafeList[i][2][j][2] + "). ";
			formattedOutput += "</span>";
		}
		formattedOutput += "<br><font color='grey'><strong>Bottom Dishes:</strong>";
		for (var j=cafeList[i][2].length-1; j>=cafeList[i][2].length-3; j--){ //loop through the bottom 3 dishes
			formattedOutput += "<span title='" + cafeList[i][2][j][1] + "'>";
			formattedOutput += cafeList[i][2][j][0] + " (" + cafeList[i][2][j][2] + "). ";
			formattedOutput += "</span>";
		}
		
		formattedOutput += "</font></div>";

	}
	
	return formattedOutput;
}

function createFooterOutput(cafeList){
	var formattedOutput = "";
	formattedOutput += "<small><font size=1>";
	formattedOutput += "Number of cafe menu pages checked: " + (cafeList.length + 1) + "<br>";
	formattedOutput += "Cafes checked: "

	for (var i=0; i<cafeList.length; i++){
		if (i != cafeList.length-1) formattedOutput += cafeList[i][0] + ", "
			else formattedOutput += cafeList[i][0] + ".";
	}
	formattedOutput += "</font></small>";
	return formattedOutput;
}

function parseCafeMenuPage(resp){

		var parser = new DOMParser ();
		htmlDoc = parser.parseFromString(resp, "text/html");


		var menuItemElements = htmlDoc.getElementsByClassName("menu-item");


		var menuItems = new Array(menuItemElements.length);
		for(var i=0; i < menuItemElements.length; i++)	
		{
			menuItems[i] = new Array(2);
			menuItems[i][0] = ""; //menuItemNames
			menuItems[i][1] = ""; //menuItemIngredients
		}

		var menuItemDisplayHtml = "";

		for(var i=0; i < menuItemElements.length; i++)
		{
			var thisMenuItemName = menuItemElements[i].getElementsByClassName("menu-item-name ")[0].innerText.trim();
			thisMenuItemName = thisMenuItemName.replace("R**",""); //remove R (Raw) symbol
			thisMenuItemName = thisMenuItemName.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g,''); //remove special characters

			var thisMenuItemIngredients = menuItemElements[i].getElementsByClassName("menu-item-ingredients")[0].innerText.trim();
			menuItems[i][0] += thisMenuItemName;
			menuItems[i][1] += thisMenuItemIngredients;
			menuItemDisplayHtml += "<strong>" + thisMenuItemName + "</strong><br>" + thisMenuItemIngredients + "<br>";
		}

		//$('#output').html(menuItemDisplayHtml);

		return menuItems;
}

function wordMatch(inputA, inputB) { 
//inputB represents the user's input. inputA is an ingredient or dish (in which we are looking for the input). 
//so we want to make sure every element of inputB matches to something in inputA
//this is a function to perform non-contiguous matching of multi-word strings. also removing plural 's' from the input for a fuzzier match
	if (inputB.replace(/[^a-zA-Z]+/g,"").length <= 1) {return false}
	if (inputA.indexOf(inputB) >= 0) { //if we have a starting match we can exit out with 'true'
		return true;
	} 
	else if (inputB.charAt(inputB.length-1) === 's') {
		var modB = inputB.slice(0,inputB.length-1);
		if (inputA.indexOf(modB) >= 0) {
			return true;
		}
	} else {
		var splB = inputB.split(" ");
		for (var i = 0; i < splB.length; i++) {
			var match = true;
			if (inputA.indexOf(splB[i]) === -1) {return false}
		}
		return true;
	}
	return false;
}


function scoreIngredients(inputList, ingredientString, checkedInputs, thisDishScore) {
	//takes the dish score after checking the name of the dish itself, and checks the ingredients as well
	ingredientString = ingredientString.toString() //convert to string so we don't get tripped up by weird characters e.g. parentheses
	ingredientString = ingredientString.toLowerCase()
	for (var i = 0; i < inputList.length; i++) { //loop through input items (likes/dislikes)
		var inputDish = inputList[i][0]
		var inputScore = inputList[i][1]
		if (wordMatch(ingredientString,inputDish) === true && checkedInputs.indexOf(inputDish) == -1) {
			if (inputScore < 0) {
				thisDishScore = inputScore
				return thisDishScore //if we have a negative score, set score to the negative score and break (do not check ingredients)
			}
			thisDishScore += inputScore
			checkedInputs.push(inputDish)
		}
	}
return thisDishScore
}

function scoreDish(inputList, dishItem) {
	console.log("dishItem: " + dishItem);
	var dishName = dishItem[0].toLowerCase()
	var checkedInputs = []
	var thisDishScore = 0
	for (var i  = 0; i < inputList.length; i++) {      //loop through input list for the dish names
		var inputDish = inputList[i][0]
		var inputScore = inputList[i][1]	
		if (wordMatch(dishName,inputDish) === true && checkedInputs.indexOf(inputDish) === -1) { //we are checking if the name of that like is in the dish name
			if (inputScore < 0) {
				thisDishScore = inputScore
				break
			//if we have a negative score, set score to the negative score and return it
			}
			thisDishScore += inputScore
			checkedInputs.push(inputDish)
		}
	}
	//console.log(checkedInputs,thisDishScore)
	thisDishScore = scoreIngredients(inputList,dishItem[1],checkedInputs,thisDishScore)
	//dishItem.push(thisDishScore) //store the dish score in the list itself for testing
	dishItem[2] = thisDishScore; //store the dish score in the list itself for testing
	return thisDishScore;
}

function scoreCafes(cafeList, inputList) {
	for (var i = 0; i < cafeList.length; i++) { //loop through cafes
		console.log("scoreCafes " + i + "||" + cafeList[i][0]);
		thisCafeScore = 0;
		for (var j = 0; j < cafeList[i][2].length; j++) { //loop through dishes for each cafe
			console.log("scoreDish" + i + "||" + j + "||" + cafeList[i][2][j][0]);
			thisCafeScore += scoreDish(inputList,cafeList[i][2][j]) //references a specific dish item (data structure of  ['dish name',['ingredient1','ingredient2']]
			console.log("scoreDish - Done" + i + "||" + j);
		}
		//cafeList[i].push(thisCafeScore);
		cafeList[i][3] = thisCafeScore;
		//console.log(cafeList[i][0]+":"+thisCafeScore);
		console.log("scoreCafes - Done " + i + "||" + cafeList[i][0]);
	}
}


function sortCafes(cafeList){

//sort dishes within each cafe
	for (var i=0; i < cafeList.length; i++) //loop through cafes
	{
			var tempDishList = cafeList[i][2];
			tempDishList.sort(function(a,b){return b[2]-a[2];});
			cafeList[i][2] = tempDishList;
	}

//sort cafes
	cafeList.sort(function(a,b){return b[3]-a[3]});
//	console.log(cafeList[0][0] + ":" + cafeList[0][3]);
}
