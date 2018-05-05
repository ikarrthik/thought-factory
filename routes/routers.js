const request = require('request');
const Promise = require('promise');
var mongoose = require('mongoose');
var ConversationV1 = require('watson-developer-cloud/conversation/v1');

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

app.get('/pay/:text',function (req,res){

var toAccount;
var amount ;
  console.log("Payment processing from node js");

      console.log("Submitted for Watson Processing => " + req.params.text);
      var text = req.params.text;
      var conversation = new ConversationV1({
        "username": "029b57d4-492d-46e4-9d65-f32e9d1ba734",
        "password": "PWgMdOsODfN2",
          "path": {
              workspace_id: "e2695800-b7f6-48ad-a6e7-673fda81bc2f"
          },
          "version_date": '2016-07-11'
      });

      conversation.message({
          input: {
              "text": text
          }
      }, function(err, data){

        console.log("response from watson");

        if(data.intents[0].intent.includes("Payment")) {
          console.log("Payment intent occured!!");
            if(data.entities[0]!= undefined  &&data.entities[0].entity.includes("sys-person")){
                toAccount = data.entities[0].value;
            }

            if(data.entities[1]!= undefined  && data.entities[1].entity.includes("sys-person")){
                toAccount = data.entities[1].value;
            }

            if(data.entities[0]!= undefined  && data.entities[0].entity.includes("sys-number")){
                amount = data.entities[0].value;
            }

            if(data.entities[1]!= undefined && data.entities[1].entity.includes("sys-number")){
                amount = data.entities[1].value;
            }
        }
          console.log("----- end -----");
          console.log(toAccount);
          console.log(amount);

          var responseText;

          if(toAccount!= undefined){
             responseText = "Payment has been processed to "+toAccount;
          }else{
             responseText = "Sorry I could not get that! Please try again";
          }
          
          res.send(responseText);

      });

});
}

module.exports = router;
