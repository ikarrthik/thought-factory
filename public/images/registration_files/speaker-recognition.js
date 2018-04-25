var thingsToRead = [
	"Never gonna give you up\nNever gonna let you down\nNever gonna run around and desert you\nNever gonna make you cry\nNever gonna say goodbye\nNever gonna tell a lie and hurt you",
	"There's a voice that keeps on calling me\n	Down the road, that's where I'll always be.\n	Every stop I make, I make a new friend,\n	Can't stay for long, just turn around and I'm gone again\n	\n	Maybe tomorrow, I'll want to settle down,\n	Until tomorrow, I'll just keep moving on.\n	\n	Down this road that never seems to end,\n	Where new adventure lies just around the bend.\n	So if you want to join me for a while,\n	Just grab your hat, come travel light, that's hobo style.",
	"They're the world's most fearsome fighting team \n	They're heroes in a half-shell and they're green\n	When the evil Shredder attacks\n	These Turtle boys don't cut him no slack! \n	Teenage Mutant Ninja Turtles\nTeenage Mutant Ninja Turtles",
	"If you're seein' things runnin' thru your head \n	Who can you call (ghostbusters)\n	An' invisible man sleepin' in your bed \n	Oh who ya gonna call (ghostbusters) \nI ain't afraid a no ghost \n	I ain't afraid a no ghost \n	Who ya gonna call (ghostbusters) \n	If you're all alone pick up the phone \n	An call (ghostbusters)",
];

var audioBlob;


function storeAudioBlob(){
	navigator.getUserMedia({audio: true}, function(stream){
		onMediaSuccess(stream, addAudioPlayer, 5);
	}, onMediaError);
}



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
		onMediaSuccess(stream, createVerificationProfile, 4);
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





//Login authenticate method
function identifyProfile(){
	//addAudioPlayer(blob);

  //Get the verification profile using the customer id
    var customerID = document.getElementById('customer_id').value;


    var url = "/identify/"+customerID;

  	var request = new XMLHttpRequest();
  	request.open("GET",url,true);
    console.log(request);

  	request.onload = function(){
            		console.log("Response came");

                var jsonResponse = JSON.parse(request.responseText);

                var profileId = jsonResponse.profileId;
                var blob = audioBlob;

                const identify = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/verify?verificationProfileId=' + profileId;

                var xmlRequest = new XMLHttpRequest();
                xmlRequest.open("POST", identify, true);

                xmlRequest.setRequestHeader('Content-Type','application/json');
                xmlRequest.setRequestHeader('Ocp-Apim-Subscription-Key', '105a215562904fcfbc2e53687805b52c');

                xmlRequest.onload = function () {
                  console.log('identifying profile');
                  console.log(xmlRequest.responseText);
                  var location = xmlRequest.getResponseHeader('Operation-Location');

                  if (location!=null) {
                    pollForIdentification(location);
                  } else {
                    console.log('Ugh. I can\'t poll, it\'s all gone wrong.');
                  }
                };

                xmlRequest.send(blob);


  	};

  	request.send();



}



function verifyProfile(blob){
    	//addAudioPlayer(blob);

    	var verify = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/verify?verificationProfileId=' + verificationProfile.profileId;

    	var request = new XMLHttpRequest();
    	request.open("POST", verify, true);

    	request.setRequestHeader('Content-Type','application/json');
    	request.setRequestHeader('Ocp-Apim-Subscription-Key', '105a215562904fcfbc2e53687805b52c');

    	request.onload = function () {
    		console.log('verifying profile');
    		console.log(request.responseText);
    	};

    	request.send(blob);
}


function createProfileForFirstTime(blob){

    	var create = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/identificationProfiles';

    	var request = new XMLHttpRequest();
    	request.open("POST", create, true);

    	request.setRequestHeader('Content-Type','application/json');
    	request.setRequestHeader('Ocp-Apim-Subscription-Key', '105a215562904fcfbc2e53687805b52c');

    	request.onload = function () {
    		console.log('creating profile');
    		console.log(request.responseText);

    		var json = JSON.parse(request.responseText);
    		var profileId = json.identificationProfileId;

    		// Now we can enrol this profile using the profileId
    		enrollProfileAudioForVerification(blob, profileId);
    	};

    	request.send(JSON.stringify({ 'locale' :'en-us'}));
  }




function enrollProfileAudio(blob, profileId){
  const enroll = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/identificationProfiles/'+profileId+'/enroll?shortAudio=true';

  var request = new XMLHttpRequest();
  request.open("POST", enroll, true);

  request.setRequestHeader('Content-Type','multipart/form-data');
  request.setRequestHeader('Ocp-Apim-Subscription-Key', '105a215562904fcfbc2e53687805b52c');

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
	//addAudioPlayer(blob);

	if (profileId == undefined)
	{
		console.log("Failed to create a profile for verification; try again");
		return;
	}

	const enroll = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/verificationProfiles/'+profileId+'/enroll';

	var request = new XMLHttpRequest();
	request.open("POST", enroll, true);

	request.setRequestHeader('Content-Type','multipart/form-data');
	request.setRequestHeader('Ocp-Apim-Subscription-Key', '105a215562904fcfbc2e53687805b52c');

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
		request.setRequestHeader('Ocp-Apim-Subscription-Key', '105a215562904fcfbc2e53687805b52c');

		request.onload = function()
		{
			console.log('getting status');
			console.log(request.responseText);

			var json = JSON.parse(request.responseText);
			if (json.status == 'succeeded' && json.processingResult.enrollmentStatus == 'Enrolled')
			{
				clearInterval(enrolledInterval);

        saveEnrollment(name , profileId);

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

function saveEnrollment(name , profileId){
  	var customerID = document.getElementById('customer_id').value;
    var accountID =  document.getElementById('account_id').value;
    var name =  document.getElementById('customer_name').value;
    var status;

  	var request = new XMLHttpRequest();
  	request.open("POST",'/enrollProfile', true);

  	request.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
  	request.onload = function()
  	{
  		console.log('getting status');
  		console.log(request.responseText);
  	};
  	request.send("customerID="+customerID+"&name="+name+"&accountID="+accountID+"&status="+responseText);

}


function pollForIdentification(location){
	var success = false;
	var enrolledInterval;

	enrolledInterval = setInterval(function()
	{
		var request = new XMLHttpRequest();
		request.open("GET", location, true);

		request.setRequestHeader('Content-Type','multipart/form-data');
		request.setRequestHeader('Ocp-Apim-Subscription-Key', '105a215562904fcfbc2e53687805b52c');

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
		request.setRequestHeader('Ocp-Apim-Subscription-Key', '105a215562904fcfbc2e53687805b52c');

		request.onload = function () {
			var json = JSON.parse(request.responseText);
			var profileId = json.verificationProfileId;
			verificationProfile.profileId = profileId;

			// Now we can enrol this profile with the profileId
			enrollProfileAudioForVerification(blob, profileId);
		};

	request.send(JSON.stringify({ 'locale' :'en-us'}));
}




function getProfileIdFromCustomerId(){

      var url = "/identify/"+customerID;

      var request = new XMLHttpRequest();
      request.open("GET",url,true);
      console.log(request);

      request.onload = function(){

          console.log("Profile id from the data base");
          response = request.responseText;

          console.log(response);
      }
      request.send();

}
//Add the audio to the UI
function addAudioPlayer(blob){

  //  convertAudioToText(blob);
  var customerID = document.getElementById('customer_id').value;

    var profileId = getProfileIdFromCustomerId(customerID);

    if(profileId == undefined || profileId == ''){


        console.log("first time enrollment");
        var newProfileId = createProfileForFirstTime(blob);

        // if profileId has been created then add it in the UI and db with the status
        enableEnrollingCheckbox();
        updateCustomerEnrollmentStatus(customerID);

    } else{

      // Alread the profile id is present and use the profile id to train other two times

    }

}

function enableEnrollingCheckbox(){
  document.getElementById('enrolling').setAttribute('checked','checked');
}

function enableEnrollingCheckbox(){
  document.getElementById('training').setAttribute('checked','checked');
}

function enableEnrollingCheckbox(){
  document.getElementById('enrolled').setAttribute('checked','checked');
}

function updateCustomerEnrollmentStatus(customerId ,status){

  var url = "/status/"+customerID;

  var request = new XMLHttpRequest();
  request.open("POST",url,true);
  console.log(request);

  request.onload = function(){

      console.log("Profile id from the data base");
      response = request.responseText;
  }
  request.send("customerID="+customerID+"status="+status);
}
