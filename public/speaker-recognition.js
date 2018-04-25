
var audioBlob;
var statusInVerification = "failure";
var profileId;

function storeAudioBlob(){
	navigator.getUserMedia({audio: true}, function(stream){
		onMediaSuccess(stream, addAudioPlayer, 5);
		console.log("StoreAudioBlob");
	}, onMediaError);
}


function loginStoreAudioBlob(){
	navigator.getUserMedia({audio: true}, function(stream){
		onMediaSuccess(stream,storeBlob , 5);
		console.log("StoreAudioBlob");
	}, onMediaError);
}

function storeBlob(blob){
	audioBlob = blob;
}

function enrollNewProfile(){
	navigator.getUserMedia({audio: true}, function(stream){
		// console.log('I\'m listening... just start talking for a few seconds...');
		// console.log('Maybe read this: \n' + thingsToRead[Math.floor(Math.random() * thingsToRead.length)]);
		onMediaSuccess(stream, createProfile, 15);
	}, onMediaError);
}

function enrollNewVerificationProfile(){
	navigator.getUserMedia({audio: true}, function(stream){
		// console.log('I\'m listening... say one of the predefined phrases...');
		onMediaSuccess(stream, createVerificationProfile, 4);
	}, onMediaError);
}

function startListeningForIdentification(){
	if (profileIds.length > 0 ){
		// console.log('I\'m listening... just start talking for a few seconds...');
		// console.log('Maybe read this: \n' + thingsToRead[Math.floor(Math.random() * thingsToRead.length)]);
		navigator.getUserMedia({audio: true}, function(stream){onMediaSuccess(stream, identifyProfile, 10)}, onMediaError);
	} else {
		console.log('No profiles enrolled yet! Click the other button...');
	}
}

function startListeningForVerification(){
	if (verificationProfile.profileId){
		// console.log('I\'m listening... say your predefined phrase...');
		navigator.getUserMedia({audio: true}, function(stream){onMediaSuccess(stream, verifyProfileAndAuthenticate, 4)}, onMediaError);
	} else {
		// console.log('No verification profile enrolled yet! Click the other button...');
	}
}

function onMediaError(e) {
    console.error('media error', e);
}





//Login authenticate method
function verifyProfileAndAuthenticate(){
	//addAudioPlayer(blob);

  //Get the verification profile using the customer id
    var customerID = document.getElementById('customer_id').value;

		console.log("customerID",customerID);
    var url = "/identify/"+customerID;

  	var request = new XMLHttpRequest();
  	request.open("GET",url,true);

  	request.onload = function(){

                var jsonResponse = JSON.parse(request.responseText);

								console.log("jsonResponse",jsonResponse)

                var profileId = jsonResponse.profileID;
                var blob = audioBlob;
								var customerID = document.getElementById('customer_id').value;
                const identify = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/verify?verificationProfileId=' + profileId;

                var xmlRequest = new XMLHttpRequest();
                xmlRequest.open("POST", identify, true);

                xmlRequest.setRequestHeader('Content-Type','application/json');
                xmlRequest.setRequestHeader('Ocp-Apim-Subscription-Key', '105a215562904fcfbc2e53687805b52c');

                xmlRequest.onload = function () {
                  console.log('verify profile');
                  console.log(xmlRequest.responseText);
									var response = JSON.parse(xmlRequest.responseText);
									if(response.result == "Accept"){
										window.location.href = "/dashboard/"+customerID;
									}else{
										//rejected
										$('#error').text("Your are not authenticated..Try Again!!!");
									}

                };

                xmlRequest.send(blob);


  	};

  	request.send();



}


function createProfileForFirstTime(blob){

    	var create = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/verificationProfiles';

    	var request = new XMLHttpRequest();
    	request.open("POST", create, true);

    	request.setRequestHeader('Content-Type','application/json');
    	request.setRequestHeader('Ocp-Apim-Subscription-Key', '105a215562904fcfbc2e53687805b52c');

    	request.onload = function () {
    		console.log('creating profile');
    		console.log(request.responseText);

    		var json = JSON.parse(request.responseText);
    		var profileId = json.verificationProfileId;

    		// Now we can enrol this profile using the profileId
    		 enrollProfileAudioForVerification(blob, profileId);
				// console.log("responseText in createProfileForFirstTime",responseText)
				// return responseText;
				console.log("enrollProfileAudioForVerification");
    	};

    	request.send(JSON.stringify({ 'locale' :'en-us'}));
  }





function enrollProfileAudioForVerification(blob, profileId){
	//addAudioPlayer(blob);
console.log("enrollProfileAudioForVerification");

	if (profileId == undefined)
	{
		console.log("Failed to create a profile for verification; try again");
		return;
	}

	const enroll = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/verificationProfiles/'+profileId+'/enroll';

	console.log("enroll",enroll);

	var request = new XMLHttpRequest();
	request.open("POST", enroll, true);

	request.setRequestHeader('Content-Type','multipart/form-data');
	request.setRequestHeader('Ocp-Apim-Subscription-Key', '105a215562904fcfbc2e53687805b52c');

	request.onload = function () {
		console.log("qwerfhbed");
		var responseText = null;

			console.log('enrolling');
			console.log(request.responseText);
			var json = JSON.parse(request.responseText);
		 //responseText = "success";
		 if(json.enrollmentStatus == "Enrolling" && json.enrollmentsCount.toString() == "1"){
		 			enableEnrollingCheckbox();
					saveEnrollment(profileId);
			 }else if (json.enrollmentStatus == "Enrolling" && json.enrollmentsCount.toString() == "2" ){
				 console.log("enrollmentsCount")
				 	enableTrainingCheckbox();
			 }else if(json.enrollmentStatus == "Enrolled"){
				 	enableEnrolledCheckbox();
					$('.proceed').text('Your account has been enrolled. Please login for authentication') ;
			 }
			console.log("response",json);
			console.log("statusInVerification",statusInVerification);

	};

	request.send(blob);
  }



function saveEnrollment(profileId){
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
  	request.send("customerID="+customerID+"&name="+name+"&accountID="+accountID+"&profileID="+profileId);

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




function getProfileIdFromCustomerId(customerID){

      // var url = "/identify/"+customerID;
			//
			// console.log("getProfileIdFromCustomerId");
			//
      // var request = new XMLHttpRequest();
      // request.open("GET",url,true);
      // //console.log(request);
			//
      // request.onload = function(){
			//
      //     console.log("Profile id from the data base");
			//
			// 			var response = JSON.parse(request.responseText);
      //     	console.log(response);
			//
			// 	//	return response.profileId;
			//
		  // }
      // request.send();

}
//Add the audio to the UI
function addAudioPlayer(blob){

  //  convertAudioToText(blob);
  var customerID = document.getElementById('customer_id').value;

	console.log("customerId",customerID);

	var url = "/identify/"+customerID;

	console.log("getProfileIdFromCustomerId");

	var request = new XMLHttpRequest();
	request.open("GET",url,true);
	//console.log(request);

	request.onload = function(){

			console.log("Profile id from the data base");

				console.log(request.responseText);
				if(request.responseText != '' && request.responseText != undefined ){
					var response = JSON.parse(request.responseText);
					console.log(response.profileID);
					profileId = response.profileID;
				}

				if(profileId == undefined || profileId == ''){

						var status = null;
		        console.log("first time enrollment");
		       createProfileForFirstTime(blob);
					 console.log("statusInVerification in addAudioPlayer",statusInVerification);
		        // if profileId has been created then add it in the UI and db with the status

		      //  updateCustomerEnrollmentStatus(customerID ,status);

		    } else{

		         var status =   enrollProfileAudioForVerification(blob, profileId);

		        //  updateCustomerEnrollmentStatus(customerID ,status);

		      // Alread the profile id is present and use the profile id to train other two times

		    }

		//	return response.profileId;

	}
	request.send();

    //var profileId = getProfileIdFromCustomerId(customerID);



}

function enableEnrollingCheckbox(){
  document.getElementById('enrolling').setAttribute('checked','checked');
}

function enableTrainingCheckbox(){
  document.getElementById('training').setAttribute('checked','checked');
}

function enableEnrolledCheckbox(){
  document.getElementById('enrolled').setAttribute('checked','checked');
}

function updateCustomerEnrollmentStatus(customerId ,status){

  var url = "/status/"+customerId;

  var request = new XMLHttpRequest();
  request.open("POST",url,true);
  console.log(request);

  request.onload = function(){

      console.log("Profile id from the data base");
      response = request.responseText;
  }
  request.send("customerID="+customerId+"status="+status);
}
