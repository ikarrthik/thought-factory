$(document).ready(function() {

	var d = new Date();
	var n = d.getMonth();

callExpenseService(n);
})

$(function() {
    $("#card-select").change(function() {
				callExpenseService($('option:selected', this).attr('value'));
    });
});
function callExpenseService(day){

	var data = {};
	$.ajax('http://localhost:3000/expenses/'+day+'/2017', {
						        type: 'GET',
						        data: JSON.stringify(data),
						        contentType: 'application/json',
						        success: function(data) {

											var parsedData = JSON.parse(data);

											$(".expenseCard").text(parsedData.totalExpense +" ₹");

										;},
						        error  : function() { console.log('error');}
						});


}
