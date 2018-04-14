const request = require('request');
const Promise = require('promise');
var mongoose = require('mongoose');
var router = function(app) {


  app.get('/home', function(req, res) {

    mongoose.model('users').findOne({'emailId':'karthik.ilango@siriuscom.com'},function(err,users){
      res.send(users);
    })
  });


  app.get('/register', function(req, res) {

    res.render("demo", {
    })
  });


  app.post('/enrollProfile', function(req, res) {

    console.log(res);
    res.render("demo", {
    })
  });

  app.post('/createProfile', function(req, res) {

    console.log("creating profile ....");
    var responseText = "create profile from node js";
    //console.log(res);

    var initializeCreateProfile = intializeProfile();

      initializeCreateProfile.then(function(result){
        console.log("Profile has been created ... ");
        console.log(result);
        res.send(responseText);
      })

  });


  function intializeProfile(){

    console.log("initialize profile ");
    var options = {
      method: 'POST',
      url: 'https://westus.api.cognitive.microsoft.com/spid/v1.0/identificationProfiles',
      headers: {
        'Ocp-Apim-Subscription-Key': '105a215562904fcfbc2e53687805b52c'
      },
      body: { locale: 'en-us' },
      json: true
    };

    return new Promise(function(resolve, reject){
          request(options , function(err , resp ,body){
            if(err){

            } else{
              console.log("Promise got resolved")
              resolve(body);
            }
          })
    })
  }


}
module.exports = router;
