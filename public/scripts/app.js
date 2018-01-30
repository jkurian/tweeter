// const flash = require('flash-message');
/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */
const name = "Jerry"
const handle = "jkurian"
const avatar = "https://ca.slack-edge.com/T2G8TE2E5-U8GHT8GBX-37cff5c2cda6-48"

$(document).ready(function () {
    // renderTweets(data);
    loadTweets();
    $(".new-tweet form").submit(function (event) {
        event.preventDefault();
        // console.log("Handler for submit called.");
        let formDataSerialized = $(this).serialize();
        // console.log(formDataSerialized);
        if (formDataSerialized === null || formDataSerialized === "") {
            console.log("error");
            return;
        }
        //Need to update to flash animations!
        if (formDataSerialized.length - 10 > 140) {
            alert("Your tweet is too long!")
            return;
        } else if (formDataSerialized.length - 10 === 0) {
            alert("Your tweet is empty!");
            return;
        }
    
        postNewTweet(name, handle, formDataSerialized, "");
        console.log("success"); // Only contains text field from tweet

    })
});

let postNewTweet = function (name, handle, formDataSerialized, date) {
    let tweetObj = createNewTweetObject(name, handle, formDataSerialized, "");
    let $newTweet = createTweetElement(tweetObj);

    $(".container").append($newTweet)
    addAnimations();
    //clear the form
    $(".new-tweet form textarea").val("");
}
let createNewTweetObject = function (name, handle, tweetBodySerialized, date) {
    let tweetObj = {
        user: {
            name: name,
            avatars: {
                small: avatar
            },
            handle: handle
        },
        content: {
            text: tweetBodySerialized.slice(10).replace(/\+/g, " ")
        },
        createdAt: ""
    };
    return tweetObj;
}
let loadTweets = function () {
    $.get("/tweets", function (data) {
        renderTweets(data);
        addAnimations();
    })
}

let addAnimations = function () {
    $(".tweets").hover(function () {
        $("#footer-icons").toggleClass("animated bounce");
        $(this).toggleClass("animated bounce");
    })
}
let renderTweets = function (tweetArray) {
    for (let tweet of tweetArray) {
        let $tweetElement = createTweetElement(tweet);
        $(".container").append($tweetElement);
    }
}

let createHeader = function (tweet) {
    let $header = $("<header>").addClass("tweet-header");
    
    let imgTag = "<img src=" + tweet.user.avatars.small + ">"

    $header.append(imgTag);
    $header.append("<h2>" + tweet.user.name);
    $header.append("<p>" + tweet.user.handle);
    // console.log("header = ", $header)
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