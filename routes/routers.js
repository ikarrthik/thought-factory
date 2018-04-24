const request = require('request');
const Promise = require('promise');
var mongoose = require('mongoose');
var router = function(app) {


  app.get('/registration', function(req, res) {

    res.render("registration",{

    });

  });


    app.get('/axis-bank', function(req, res) {

        res.render("home",{

        });
    });



app.get('/identify/:customerID', function(req, res) {

    console.log("customer id"+req.params.customerID);

    var customerID = req.params.customerID;

    mongoose.model('users').findOne({'customerID':customerID},function(err,user){

        if(err){
          res.send("No customer found");
        } else{
            //res.responseText = user;
            var responseText = user;
            res.send(responseText);
        }

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
