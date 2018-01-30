const maxLetters = 140;
//A simple character counter which is rendered to .new-tweet
//If the number of words in the tweet text box is above 140,
//we change the font color to red, otherwise it is white
$(document).ready(function () {
    console.log('ready');

    $('.new-tweet textarea').on('keyup', function () {
        let lettersUsed = $(this).val().length;
        //set the text on the page
        $(this).parent().children('.counter').text(140 - lettersUsed);
        //set the color if we are over 140 characters (including whitespace)
        if(lettersUsed > maxLetters) {
            $(this).parent().children('.counter').css('color', 'red');
        } else if (lettersUsed <= maxLetters) {
            $(this).parent().children('.counter').css('color', 'white');  
        }
    });
})