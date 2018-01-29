$(document).ready(function () {
    console.log('ready');

    $('.new-tweet textarea')[0].addEventListener('keyup', function () {
        let wordsLeft = $(this).val().split('');
        console.log(wordsLeft);
        $(this).parent().children('.counter').text(140 - wordsLeft.length);
        
        if(wordsLeft.length > 140) {
            $(this).parent().children('.counter').css('color', 'red');
        } else {
            $(this).parent().children('.counter').css('color', 'white');  
        }
    });
})