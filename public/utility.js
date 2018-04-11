$(function() {
    function openModal(event) {
        console.log("clicked");
        $("#modal1").css('display', 'block');
        $("#modal1").addClass("modalCss");
        $(".container").addClass("bodyBlur");
        $("nav").addClass("bodyBlur");
        return false;
    }

    function closeModal(event) {
        console.log("clicked");
        $("#modal1").css('display', 'none');
        $(".container").removeClass("bodyBlur");
        $("nav").removeClass("bodyBlur");
        return false;
    }
    $('#triggerid').click(openModal);
    $('#cancelId').click(closeModal);
    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15, // Creates a dropdown of 15 years to control year,
        today: 'Today',
        clear: 'Clear',
        close: 'Ok',
        closeOnSelect: false // Close upon selecting a date,
    });

});

$(document).ready(function() {
    $('select').material_select();
});


// Add button click handler
$(document).ready(function() {


    itemIndex = 0;
    totalAmount = 0;
    arrayOfAmount = [];



    $('#itemForm').on('click', '.addItem', function() {
        itemIndex++;
        var $template = $('#itemTemplate'),
            $clone = $template
            .clone()
            .removeClass('hide')
            .removeAttr('id')
            .attr('data-item-index', itemIndex)
            .insertBefore($template);


        // Update the name attributes
        $clone.find('[name="cloneditem"]').attr('id', 'item' + itemIndex + '').end()
        $clone.find('[name="clonedquantity"]').attr('id', 'quantity' + itemIndex + '').end()
        $clone.find('[name="clonedrate"]').attr('id', 'rate' + itemIndex + '').end();
        $clone.find('[name="clonedamount"]').attr('id', 'amount' + itemIndex + '').end();

        // Add new fields

    })

    // Remove button click handler
    $('#itemForm').on('click', '.removeItem', function() {
        console.log("remove clicked");
        var $row = $(this).parents('.form-group'),
            index = $row.attr('data-item-index');
        $row.remove();
    });
});

$(document).on('keyup', '.itemTable *', function(e) {

    var row = e.target.attributes.getNamedItem("id").value;
    var rowNumber = row.replace(/[^\d.]/g, '');

    var qty = $("#quantity" + rowNumber);
    var rte = $("#rate" + rowNumber);
    var amount = $("#amount" + rowNumber);

    var total1 = isNaN(parseInt(qty.val() * $(rte).val())) ? 0 : (qty.val() * $(rte).val());
    $(amount).text(parseFloat(Math.round(total1 * 100) / 100).toFixed(2));

    var index = arrayOfAmount.indexOf(rowNumber);
    arrayOfAmount[rowNumber] = total1;

    var total2 = isNaN(parseInt(rte.val() * $(qty).val())) ? 0 : (rte.val() * $(qty).val());
    $(amount).text(parseFloat(Math.round(total2 * 100) / 100).toFixed(2));

    var index = arrayOfAmount.indexOf(rowNumber);
    arrayOfAmount[rowNumber] = total2;

    var sum = arrayOfAmount.reduce((a, b) => a + b, 0);
    $("#total").text(parseFloat(Math.round(sum * 100) / 100).toFixed(2));

});
