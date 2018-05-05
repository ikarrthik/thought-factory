var audioBlob;
var statusInVerification = "failure";
var profileId;
var subscriptionKey = 'a3e8a12a0d6e4506b6247534f95f78ac';
var speechSubscriptionKey = '427ce0ad79c44e4db09e5b435ec9a311';

//Registration
function storeAudioBlob() {
    navigator.getUserMedia({
        audio: true
    }, function(stream) {
        $('.progress').show();
        onMediaSuccess(stream, addAudioPlayer, 3);
    }, onMediaError);
}


//Login
function loginStoreAudioBlob() {
    navigator.getUserMedia({
        audio: true
    }, function(stream) {
        $('.progress').show();
        onMediaSuccess(stream, verifyProfileAndAuthenticate, 3);
    }, onMediaError);
}

//Payment
function pay() {
    navigator.getUserMedia({
        audio: true
    }, function(stream) {
        onMediaSuccess(stream, speechToText, 4);
    }, onMediaError);
}


function storeBlob(blob) {
    audioBlob = blob;
}



function onMediaError(e) {
    console.error('media error', e);
}




//Login authenticate method
function verifyProfileAndAuthenticate(blob) {
    //addAudioPlayer(blob);

    //Get the verification profile using the customer id
    var customerID = document.getElementById('customer_id').value;

    console.log("customerID", customerID);
    var url = "/identify/" + customerID;

    var request = new XMLHttpRequest();
    request.open("GET", url, true);

    request.onload = function() {

        var jsonResponse = JSON.parse(request.responseText);

        console.log("jsonResponse", jsonResponse)

        var profileId = jsonResponse.profileID;
        var customerID = document.getElementById('customer_id').value;
        var identify = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/verify?verificationProfileId=' + profileId;

        var xmlRequest = new XMLHttpRequest();
        xmlRequest.open("POST", identify, true);

        xmlRequest.setRequestHeader('Content-Type', 'application/json');
        xmlRequest.setRequestHeader('Ocp-Apim-Subscription-Key', subscriptionKey);

        xmlRequest.onload = function() {
            $('.determinate').css('width','50%');
            console.log('verify profile');
            console.log(xmlRequest.responseText);
            var response = JSON.parse(xmlRequest.responseText);
            if (response.result == "Accept") {
                $('.determinate').css('width','100%');
                window.location.href = "/dashboard/" + customerID;
                $('.progress').hide();
                $('.determinate').css('width','10%');
            } else {
                //rejected
                setTimeout (function(){
                  $('.progress').hide();
                  $('.determinate').css('width','10%');
                }, 1000);
                $('#error').text("Your are not authenticated..Try Again!!!");
            }

        };
        xmlRequest.send(blob);
    };
    request.send();

}


function createProfileForFirstTime(blob) {

    var create = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/verificationProfiles';

    var request = new XMLHttpRequest();
    request.open("POST", create, true);

    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Ocp-Apim-Subscription-Key', subscriptionKey);

    request.onload = function() {
        $('.determinate').css('width','60%');
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

    request.send(JSON.stringify({
        'locale': 'en-us'
    }));
}




function enrollProfileAudioForVerification(blob, profileId) {
    //addAudioPlayer(blob);
    console.log("enrollProfileAudioForVerification");

    if (profileId == undefined) {
        console.log("Failed to create a profile for verification; try again");
        return;
    }

    const enroll = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/verificationProfiles/' + profileId + '/enroll';

    console.log("enroll", enroll);

    var request = new XMLHttpRequest();
    request.open("POST", enroll, true);

    request.setRequestHeader('Content-Type', 'multipart/form-data');
    request.setRequestHeader('Ocp-Apim-Subscription-Key', subscriptionKey);

    request.onload = function() {
        $('.determinate').css('width','90%');
        var responseText = null;

        console.log('enrolling');
        console.log(request.responseText);
        var json = JSON.parse(request.responseText);
        //responseText = "success";
        if (json.enrollmentStatus == "Enrolling" && json.enrollmentsCount.toString() == "1") {
            $('.determinate').css('width','100%');
            setTimeout (function(){
              $('.progress').hide();
              $('.determinate').css('width','10%');
            }, 2000);
            enableEnrollingCheckbox();
            saveEnrollment(profileId);
        } else if (json.enrollmentStatus == "Enrolling" && json.enrollmentsCount.toString() == "2") {
            $('.determinate').css('width','100%');
            setTimeout (function(){
              $('.progress').hide();
              $('.determinate').css('width','10%');
            }, 2000);
            console.log("enrollmentsCount")
            enableTrainingCheckbox();
        } else if (json.enrollmentStatus == "Enrolled") {
            $('.determinate').css('width','100%');
            setTimeout (function(){
              $('.progress').hide();
              $('.determinate').css('width','10%');
            }, 2000);
            enableEnrolledCheckbox();
            $('.proceed').text('Your account has been enrolled. Please login for authentication');
        }
        console.log("response", json);
        console.log("statusInVerification", statusInVerification);

    };

    request.send(blob);
}



function saveEnrollment(profileId) {
    var customerID = document.getElementById('customer_id').value;
    var accountID = document.getElementById('account_id').value;
    var name = document.getElementById('customer_name').value;
    var status;

    var request = new XMLHttpRequest();
    request.open("POST", '/enrollProfile', true);

    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.onload = function() {
        console.log('getting status');
        console.log(request.responseText);
    };
    request.send("customerID=" + customerID + "&name=" + name + "&accountID=" + accountID + "&profileID=" + profileId);

}



function createVerificationProfile(blob) {

    if (verificationProfile && verificationProfile.profileId) {
        if (verificationProfile.remainingEnrollments == 0) {
            console.log("Verification enrollment already completed");
            return;
        } else {
            console.log("Verification enrollments remaining: " + verificationProfile.remainingEnrollments);
            enrollProfileAudioForVerification(blob, verificationProfile.profileId);
            return;
        }
    }

    var create = 'https://westus.api.cognitive.microsoft.com/spid/v1.0/verificationProfiles';

    var request = new XMLHttpRequest();
    request.open("POST", create, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Ocp-Apim-Subscription-Key', subscriptionKey);

    request.onload = function() {
        var json = JSON.parse(request.responseText);
        var profileId = json.verificationProfileId;
        verificationProfile.profileId = profileId;

        // Now we can enrol this profile with the profileId
        enrollProfileAudioForVerification(blob, profileId);
    };

    request.send(JSON.stringify({
        'locale': 'en-us'
    }));
}



//Add the audio to the UI
function addAudioPlayer(blob) {

    //  convertAudioToText(blob);
    var customerID = document.getElementById('customer_id').value;

    console.log("customerId", customerID);
    var url = "/identify/" + customerID;
    console.log("getProfileIdFromCustomerId");
    var request = new XMLHttpRequest();
    request.open("GET", url, true);

    request.onload = function() {

        $('.determinate').css('width','40%');
        console.log("Profile id from the data base");

        console.log(request.responseText);
        if (request.responseText != '' && request.responseText != undefined) {
            var response = JSON.parse(request.responseText);
            console.log(response.profileID);
            profileId = response.profileID;
        }

        if (profileId == undefined || profileId == '') {
            console.log("first time enrollment");
            createProfileForFirstTime(blob);
            console.log("statusInVerification in addAudioPlayer", statusInVerification);
            // if profileId has been created then add it in the UI and db with the status
            //  updateCustomerEnrollmentStatus(customerID ,status);
        } else {
            var status = enrollProfileAudioForVerification(blob, profileId);
            // Alread the profile id is present and use the profile id to train other two times
        }


    }
    request.send();

}

function speechToText(blob){
	var create = 'https://speech.platform.bing.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US';

  console.log("speech to text api calls");

	var request = new XMLHttpRequest();
	request.open("POST", create, true);

	request.setRequestHeader('Content-Type', 'audio/wav; codec=audio/pcm; samplerate=16000');
	request.setRequestHeader('Ocp-Apim-Subscription-Key', speechSubscriptionKey);

	request.onload = function() {

      console.log("function start");
			console.log(request.responseText);

			var textResponse = JSON.parse(request.responseText);
      console.log("textResponse:",textResponse);
      var text = textResponse.DisplayText;
      console.log("text:",text);
      var dt = new Date();
      var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
      chatJS.userMessage(text, time);

			var url = "/pay/"+text;

			var payRequest = new XMLHttpRequest();
			payRequest.open("GET", url, true);

			payRequest.onload = function() {

        console.log("Response from NLP");
        console.log(payRequest);
				console.log(payRequest.responseText);
        var dt = new Date();
        var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
        chatJS.botMessage(payRequest.responseText, time);
			}
			payRequest.send();
	};

	request.send(blob);

}




function enableEnrollingCheckbox() {
    document.getElementById('enrolling').setAttribute('checked', 'checked');
}

function enableTrainingCheckbox() {
    document.getElementById('training').setAttribute('checked', 'checked');
}

function enableEnrolledCheckbox() {
    document.getElementById('enrolled').setAttribute('checked', 'checked');
}

function updateCustomerEnrollmentStatus(customerId, status) {

    var url = "/status/" + customerId;

    var request = new XMLHttpRequest();
    request.open("POST", url, true);
    console.log(request);

    request.onload = function() {

        console.log("Profile id from the data base");
        response = request.responseText;
    }
    request.send("customerID=" + customerId + "s`tatus=" + status);
}
