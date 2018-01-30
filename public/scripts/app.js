// const flash = require('flash-message');
/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */
$(document).ready( function () {
    // renderTweets(data);
    loadTweets();
    $(".new-tweet form").submit( function (event) {
        event.preventDefault();
        console.log("Handler for submit called.");
        let formDataSerialized = $(this).serialize();
        console.log(formDataSerialized);
        if(formDataSerialized === null || formDataSerialized === "") {
            console.log("error");
            return;
        }
        //Need to update to flash animations!
        if( formDataSerialized.length - 10 > 140) {
            alert("Your tweet is too long!")
            return;
        } else if (formDataSerialized.length - 10 === 0) {
            alert("Your tweet is empty!");
            return;
        }
        console.log("success"); // Only contains text field from tweet

    })
}); 

let loadTweets = function () {
    $.get("/tweets", function (data) {
        renderTweets(data);
        addAnimations();
    })
}

let addAnimations = function () {
    $(".tweets").hover( function () {
        $("#footer-icons").toggleClass("animated bounce");
        $(this).toggleClass("animated bounce");
    })
}
let renderTweets = function (tweetArray) {
    for(let tweet of tweetArray ) {
        let $tweetElement = createTweetElement(tweet);
        $(".container").append($tweetElement);
    }
}

let createHeader = function (tweet) {
    let $header = $("<header>").addClass("tweet-header");
    $header.append("<img>").attr("src", tweet.user.avatars.small)
    $header.append("<h2>" + tweet.user.name);
    $header.append("<p>" + tweet.user.handle);
    
    return $header;
}

let createFooter = function (tweet) {
    let $footer = $("<footer>").addClass("tweet-footer clearfix");
    $footer.append("<p>10 days old"); //Have to add date element
    let $footerIcons = $("<div>").attr("class", "footer-icons");
    $footerIcons.append("<i class='material-icons'>rotate_left")
    $footerIcons.append("<i class='material-icons'>favorite")
    $footerIcons.append("<i class='material-icons'>flag")
    $footer.append($footerIcons);
    
    return $footer;
}

let createTweetElement = function (tweet) {
    let $tweetArticle = $("<section class='tweets'>");
    let $innerArticle = $("<article>");

    let $header = createHeader(tweet);
    $innerArticle.append($header);

    $innerArticle.append("<div class='tweet-body clearfix'><p>" + tweet.content.text);

    let $footer = createFooter(tweet);
    $innerArticle.append($footer);
    
    $tweetArticle.append($innerArticle);

    return $tweetArticle;
}