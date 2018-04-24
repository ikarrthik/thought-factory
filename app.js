var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongoose = require('mongoose');

var constants = require('./constants/constant');
// var index =require('./views/index');
var app = express();

//Body parser middleware

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
  extended: true
})); // for parsing application/x-www-form-urlencoded

app.use(expressValidator())
// var logger=function(req,res,next){
//   console.log("The url hit is : "+req.url);
//   next();
// }
//
// app.use(logger);

//set static files path
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

mongoose.connect('mongodb://admin:admin@ds135619.mlab.com:35619/incognito');
mongoose.model('users',{name :String , customerID :String , profileID :String ,picture :String ,accountID :String});

var routes = require('./routes/routers')(app);


app.listen(3000, function() {
  console.log('Server started on port 3000');
});
