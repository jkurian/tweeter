$(document).ready(function () {
    console.log('ready');

    $('.new-tweet textarea')[0].addEventListener('keyup', function () {
        let lettersUsed = $(this).val().split('').length;
        $(this).parent().children('.counter').text(140 - lettersUsed);

        if(lettersUsed.length > 140) {
            $(this).parent().children('.counter').css('color', 'red');
        } else {
            $(this).parent().children('.counter').css('color', 'white');  
        }
    });
})