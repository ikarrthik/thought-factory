
var thingsToRead = [
	"Never gonna give you up\nNever gonna let you down\nNever gonna run around and desert you\nNever gonna make you cry\nNever gonna say goodbye\nNever gonna tell a lie and hurt you",
	"There's a voice that keeps on calling me\n	Down the road, that's where I'll always be.\n	Every stop I make, I make a new friend,\n	Can't stay for long, just turn around and I'm gone again\n	\n	Maybe tomorrow, I'll want to settle down,\n	Until tomorrow, I'll just keep moving on.\n	\n	Down this road that never seems to end,\n	Where new adventure lies just around the bend.\n	So if you want to join me for a while,\n	Just grab your hat, come travel light, that's hobo style.",
	"They're the world's most fearsome fighting team \n	They're heroes in a half-shell and they're green\n	When the evil Shredder attacks\n	These Turtle boys don't cut him no slack! \n	Teenage Mutant Ninja Turtles\nTeenage Mutant Ninja Turtles",
	"If you're seein' things runnin' thru your head \n	Who can you call (ghostbusters)\n	An' invisible man sleepin' in your bed \n	Oh who ya gonna call (ghostbusters) \nI ain't afraid a no ghost \n	I ain't afraid a no ghost \n	Who ya gonna call (ghostbusters) \n	If you're all alone pick up the phone \n	An call (ghostbusters)",
];

function enrollNewProfile(){
	navigator.getUserMedia({audio: true}, function(stream){
		console.log('I\'m listening... just start talking for a few seconds...');
		console.log('Maybe read this: \n' + thingsToRead[Math.floor(Math.random() * thingsToRead.length)]);
		onMediaSuccess(stream, createProfile, 15);
	}, onMediaError);
}

function enrollNewVerificationProfile(){
	navigator.getUserMedia({audio: true}, function(stream){
		console.log('I\'m listening... say one of the predefined phrases...');
		onMediaSuccess(streamstartListeningForIdentificati createVerificationProfile, 4);
	}, onMediaError);
}

function startListeningForIdentification(){
	if (profileIds.length > 0 ){
		console.log('I\'m listening... just start talking for a few seconds...');
		console.log('Maybe read this: \n' + thingsToRead[Math.floor(Math.random() * thingsToRead.length)]);
		navigator.getUserMedia({audio: true}, function(stream){onMediaSuccess(stream, identifyProfile, 10)}, onMediaError);
	} else {
		console.log('No profiles enrolled yet! Click the other button...');
	}
}

function startListeningForVerification(){
	if (verificationProfile.profileId){
		console.log('I\'m listening... say your predefined phrase...');
		navigator.getUserMedia({audio: true}, function(stream){onMediaSuccess(stream, verifyProfile, 4)}, onMediaError);
	} else {
		console.log('No verification profile enrolled yet! Click the other button...');
	}
}

function onMediaError(e) {
    console.error('media error', e);
}

function identifyProfile(blob){
	addAudioPlayer(blob);

	var Ids = profileIds.map(x => x.profileId).join();
	const identify = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/identify?identificationProfileIds=' + Ids + '&shortAudio=true';

	var request = new XMLHttpRequest();
	request.open("POST", identify, true);

	request.setRequestHeader('Content-Type','application/json');
	request.setRequestHeader('Ocp-Apim-Subscription-Key', key);

	request.onload = function () {
		console.log('identifying profile');
		console.log(request.responseText);
		var location = request.getResponseHeader('Operation-Location');

		if (location!=null) {
			pollForIdentification(location);
		} else {
			console.log('Ugh. I can\'t poll, it\'s all gone wrong.');
		}
	};

	request.send(blob);
}

function verifyProfile(blob){
	addAudioPlayer(blob);

	var verify = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/verify?verificationProfileId=' + verificationProfile.profileId;

	var request = new XMLHttpRequest();
	request.open("POST", verify, true);

	request.setRequestHeader('Content-Type','application/json');
	request.setRequestHeader('Ocp-Apim-Subscription-Key', key);

	request.onload = function () {
		console.log('verifying profile');
		console.log(request.responseText);
	};

	request.send(blob);
}

function createProfile(blob){
	addAudioPlayer(blob);


	var url = "/createProfile"

	var request = new XMLHttpRequest();
	request.open("POST",url,true);

	request.onload = function(){
		console.log("Response came");
		console.log(request);
	};

	request.send(blob);

	// var create = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/identificationProfiles';
	//
	// var request = new XMLHttpRequest();
	// request.open("POST", create, true);
	//
	// request.setRequestHeader('Content-Type','application/json');
	// request.setRequestHeader('Ocp-Apim-Subscription-Key', key);
	//
	// request.onload = function () {
	// 	console.log('creating profile');
	// 	console.log(request.responseText);
	//
	// 	var json = JSON.parse(request.responseText);
	// 	var profileId = json.identificationProfileId;
	//
	// 	// Now we can enrol this profile using the profileId
	// 	enrollProfileAudio(blob, profileId);
	// };
	//
	// request.send(JSON.stringify({ 'locale' :'en-us'}));
}

function enrollProfileAudio(blob, profileId){
  //const enroll = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/identificationProfiles/'+profileId+'/enroll?shortAudio=true';

	const enroll = '/enrollProfile';

	console.log("Enroll profile audio");
  var request = new XMLHttpRequest();
  request.open("POST", enroll, true);

  request.setRequestHeader('Content-Type','multipart/form-data');
  request.setRequestHeader('Ocp-Apim-Subscription-Key', key);

  request.onload = function () {
  	console.log('enrolling');
    console.log(request.responseText);
    var location = request.getResponseHeader('Operation-Location');

    //console.log(location);

	if (location!=null) {
    	pollForEnrollment(location, profileId);
	} else {
		console.log('Ugh. I can\'t poll, it\'s all gone wrong.');
	}
  };

  request.send(blob);
}

function enrollProfileAudioForVerification(blob, profileId){
	addAudioPlayer(blob);

	if (profileId == undefined)
	{
		console.log("Failed to create a profile for verification; try again");
		return;
	}

	const enroll = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/verificationProfiles/'+profileId+'/enroll';

	var request = new XMLHttpRequest();
	request.open("POST", enroll, true);

	request.setRequestHeader('Content-Type','multipart/form-data');
	request.setRequestHeader('Ocp-Apim-Subscription-Key', key);

	request.onload = function () {
		console.log('enrolling');
		console.log(request.responseText);

		var json = JSON.parse(request.responseText);
		verificationProfile.remainingEnrollments = json.remainingEnrollments;
		if (verificationProfile.remainingEnrollments == 0)
		{
			console.log("Verification should be enabled!")
		}
	};

	request.send(blob);
  }


  function pollForEnrollment(location, profileId){
	var success = false;
	var enrolledInterval;

	enrolledInterval = setInterval(function()
	{
		var request = new XMLHttpRequest();
		request.open("GET", location, true);

		request.setRequestHeader('Content-Type','multipart/form-data');
		request.setRequestHeader('Ocp-Apim-Subscription-Key', key);

		request.onload = function()
		{
			console.log('getting status');
			console.log(request.responseText);

			var json = JSON.parse(request.responseText);
			if (json.status == 'succeeded' && json.processingResult.enrollmentStatus == 'Enrolled')
			{
				clearInterval(enrolledInterval);
				console.log('enrollment complete!');
				var name = window.prompt('Who was that talking?');
				profileIds.push(new Profile(name, profileId));
				console.log(profileId + ' is now mapped to ' + name);
			}
			else if(json.status == 'succeeded' && json.processingResult.remainingEnrollmentSpeechTime > 0) {
				clearInterval(enrolledInterval);
				console.log('That audio wasn\'t long enough to use');
			}
			else
			{
				console.log('Not done yet..');
				console.log(json);
			}
		};

		request.send();
	}, 4000);
}

function pollForIdentification(location){
	var success = false;
	var enrolledInterval;

	enrolledInterval = setInterval(function()
	{
		var request = new XMLHttpRequest();
		request.open("GET", location, true);

		request.setRequestHeader('Content-Type','multipart/form-data');
		request.setRequestHeader('Ocp-Apim-Subscription-Key', key);

		request.onload = function()
		{
			console.log('getting status');
			console.log(request.responseText);

			var json = JSON.parse(request.responseText);
			if (json.status == 'succeeded')
			{
				clearInterval(enrolledInterval);
				var speaker = profileIds.filter(function(p){return p.profileId == json.processingResult.identifiedProfileId});

				if (speaker != null && speaker.length > 0){
					console.log('I think ' + speaker[0].name + ' was talking');
				} else {
					console.log('I couldn\'t tell who was talking. So embarrassing.');
				}
			}
			else
			{
				console.log('still thinking..');
				console.log(json);
			}
		};

		request.send();
	}, 2000);
}

function createVerificationProfile(blob){

	if (verificationProfile && verificationProfile.profileId)
	{
		if (verificationProfile.remainingEnrollments == 0)
		{
			console.log("Verification enrollment already completed");
			return;
		}
		else
		{
			console.log("Verification enrollments remaining: " + verificationProfile.remainingEnrollments);
			enrollProfileAudioForVerification(blob, verificationProfile.profileId);
			return;
		}
	}

	var create = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/verificationProfiles';

	var request = new XMLHttpRequest();
		request.open("POST", create, true);
		request.setRequestHeader('Content-Type','application/json');
		request.setRequestHeader('Ocp-Apim-Subscription-Key', key);

		request.onload = function () {
			var json = JSON.parse(request.responseText);
			var profileId = json.verificationProfileId;
			verificationProfile.profileId = profileId;

			// Now we can enrol this profile with the profileId
			enrollProfileAudioForVerification(blob, profileId);
		};

	request.send(JSON.stringify({ 'locale' :'en-us'}));
}

function BurnItAll(mode = 'identification'){
	// brute force delete everything - keep retrying until it's empty
	var listing = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/' + mode + 'Profiles';

	var request = new XMLHttpRequest();
	request.open("GET", listing, true);

	request.setRequestHeader('Content-Type','multipart/form-data');
	request.setRequestHeader('Ocp-Apim-Subscription-Key', key);

	request.onload = function () {
		var json = JSON.parse(request.responseText);
		for(var x in json){
			if (json[x][mode + 'ProfileId'] == undefined) {continue;}
			var request2 = new XMLHttpRequest();
			request2.open("DELETE", listing + '/'+ json[x][mode + 'ProfileId'], true);

			request2.setRequestHeader('Content-Type','multipart/form-data');
			request2.setRequestHeader('Ocp-Apim-Subscription-Key', key);
			request2.onload = function(){
				console.log(request2.responseText);
			};
			request2.send();
		}
	};

	request.send();
}

function addAudioPlayer(blob){
	var url = URL.createObjectURL(blob);
	var log = document.getElementById('log');

	var audio = document.querySelector('#replay');
	if (audio != null) {audio.parentNode.removeChild(audio);}

	audio = document.createElement('audio');
	audio.setAttribute('id','replay');
	audio.setAttribute('controls','controls');

	var source = document.createElement('source');
	source.src = url;

	audio.appendChild(source);
	log.parentNode.insertBefore(audio, log);
}

// found on SO: vanilla javascript queystring management
var qs = (function(a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
        var p=a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
})(window.location.search.substr(1).split('&'));

var key = '105a215562904fcfbc2e53687805b52c';

// Speaker Recognition API profile configuration
var Profile = class { constructor (name, profileId) { this.name = name; this.profileId = profileId;}};
var VerificationProfile = class { constructor (name, profileId) { this.name = name; this.profileId = profileId; this.remainingEnrollments = 3}};
var profileIds = [];
var verificationProfile = new VerificationProfile();

// Helper functions - found on SO: really easy way to dump the console logs to the page
(function () {
	var old = console.log;
	var logger = document.getElementById('log');
	var isScrolledToBottom = logger.scrollHeight - logger.clientHeight <= logger.scrollTop + 1;

	console.log = function () {
		for (var i = 0; i < arguments.length; i++) {
			if (typeof arguments[i] == 'object') {
				logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(arguments[i], undefined, 2) : arguments[i]) + '<br />';
			} else {
				logger.innerHTML += arguments[i] + '<br />';
			}
			if(isScrolledToBottom) logger.scrollTop = logger.scrollHeight - logger.clientHeight;
		}
		old(...arguments);
	}
	console.error = console.log;
})();
