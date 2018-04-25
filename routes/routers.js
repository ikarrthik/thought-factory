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
            console.log("user profile Id",user);
            console.log("value" , user);

            var responseText = user;
            res.send(responseText);
        }

   })
});

app.post('/status/:customerID', function(req, res) {

    console.log("customer id"+req.params.customerID);

    var customerID = req.params.customerID;

    res.send("success");

});
app.get('/dashboard/:customerID', function(req, res) {
  console.log("customer id: "+req.params.customerID);

  var customerID = req.params.customerID;

    mongoose.model('users').findOne({'customerID':customerID},function(err,user){

    console.log("userrrrr",user);

    res.render("dashboard",{
      'user':user
    });
 });
});

app.post('/enrollProfile', function(req, res) {



  var  stringify = JSON.stringify(req.body);
  console.log(stringify.customerID);
  //console.log("req1"+JSON.parse(req));
  var UserModel = mongoose.model('users');
   var user = new UserModel(req.body)
   user.save(function(err){
    if(err){
      var responseText = "failure";
      res.send(responseText);
    } else{
        //res.responseText = user;
        var responseText = "success";
        res.send(responseText);
    }
  });

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
