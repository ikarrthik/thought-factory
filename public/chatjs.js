var chatJS = {
botMessage : function(message, time) {
if(message!="")
{
var msgBox = $('<div class="inner-chat"> <img src="../images/bot.jpg" alt="Avatar" style="width:100%;"> <p>' +message+'</p> <span class="time-right">'+time+'</span> </div>');
$('#chat').append(msgBox);
$("#chat").animate({ scrollTop: $('#chat').prop("scrollHeight")}, 500);
}
},

userMessage : function(message, time) {
if(message!="")
{
var msgBox = $('<div class="inner-chat darker"> <img src="../images/avatar4.png" alt="Avatar" class="right" style="width:100%;"> <p>'+message+'</p> <span class="time-left">'+time+'</span> </div>');
$('#chat').append(msgBox);
$("#chat").animate({ scrollTop: $('#chat').prop("scrollHeight")}, 500);
}

},
};

$(document).ready(function(){

});
