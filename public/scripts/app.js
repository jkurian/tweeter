// const flash = require('flash-message');
/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */

$(document).ready(function () {
    loadTweets();

    // $('.tweet').on('click', function () {
    //     console.log('clicked tweet')
    // })

    //Event hanlder for submit on the tweet form
    $(".new-tweet form").submit(function (event) {
        event.preventDefault();

        //Should I use this here? Maybe refactor
        let tweetBody = $('.new-tweet form textarea[name="tweetText"]').val();
        //If the tweetBody is null or an empty string we do not make the POST request
        if (!tweetBody) {
            alert("You cant tweet nothing!");
            return;
        }
        //Alert the user if their tweet is too long or empty and return
        if (tweetBody.length > 140) {
            alert("Your tweet is too long!")
            return;
        } 

        //If we get here, the tweet is valid and we can make the POST request which is
        //within the postNewTweet method
        postNewTweet(escape(tweetBody));
    })

    //On click hander which hides the compose tweet section which clicked
    //If the .new-tweet section is visible, we set it to focus so the client
    //can begin typing their tweet immediately
    $("#nav-bar > .compose-tweet").on('click', function (event) {
        $(".new-tweet").slideToggle("slow", () => {
            if ($(".new-tweet").is(':visible')) {
                $(".new-tweet form textarea").focus();
            }
        });
    })
});

//POST request to add new tweet to mongo database (tweets collection)
let postNewTweet = function (tweetBody) {
    //To pass to the post for writing the tweet
    let tweetText = {
        text: tweetBody
    }
    $.post("/tweets", tweetText, function (data) {
        clearTweets();
        loadTweets();
        addAnimations();
    })
    //clear the form after we tweet
    $(".new-tweet form textarea").val("");
    $(".new-tweet form > .counter").text(140);
}

//To prevent script injections
let escape = function (str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

let clearTweets = function () {
    $(".tweets").remove()
}
//GET all the tweets found in the mongodb and render them to the page
//We also reload the animations after rendering the tweets
let loadTweets = function () {
    $.get("/tweets", function (data) {
        renderTweets(data);
        addAnimations();
    })
}

//Adds bounce animation to all the tweets on hover
let addAnimations = function () {
    $(".tweets").hover(function () {
        $("#footer-icons").toggleClass("animated bounce");
        $(this).toggleClass("animated bounce");
    })
}

let updateLike = function (tweet, $tweetElement) {
    let id = $tweetElement.attr('id');
    // let likes = ($tweet.data('likes'));
    // $tweet.data('likes', ++likes);
    // tweet.user.name = "changed_name"
    if($tweetElement.data('liked')) {
        tweet.likes--;
        $tweetElement.data('liked', false);
        $(`#${id} .heart`).text(`favorite_border`)
    } else {
        tweet.likes++;
        $tweetElement.data('liked', true);
        $(`#${id} .heart`).text(`favorite`)
    }   
    let likes = tweet.likes;
    $tweetElement.data('likes', tweet.likes);
    $(`#${id} .tweet-likes`).text(`${tweet.likes} likes`);
    // let likes = $tweetElement.data('likes');
    // ++likes;
    // $tweetElement = createTweetElement(tweet);
//    $.post("/tweets", tweetText, function (data) {
//     clearTweets();
//     loadTweets();
//     addAnimations();
// })
    let tweetObj = {
        _id: tweet._id,
        likes: tweet.likes
    }
    //This should be a PUT
   $.post('/tweets/likes/', tweetObj, function() {
       console.log('updated database');
   })
    // console.log(likes);
}
//Goes through the array of tweets, generates the tweet element in
//createTweetElement with JQuery and render it
let renderTweets = function (tweetArray) {
    for (let tweet of tweetArray) {
        console.log(tweet);
        let $tweetElement = createTweetElement(tweet);
        $tweetElement.data('liked', false);
        $tweetElement.data('likes', tweet.likes);
        $tweetElement.append(`<p class='tweet-likes'>${tweet.likes} likes</p>`)
        $tweetElement.on('click', () => updateLike(tweet, $tweetElement));
        $(".container").append($tweetElement);
    }
}

//Create the header for the tweeter page
let createHeader = function (tweet) {
    let $header = $("<header>").addClass("tweet-header");

    let imgAndName = "<div><img src=" + tweet.user.avatars.small + ">" + "<h2>" + tweet.user.name;
    $header.append(imgAndName);
    $header.append("<p>" + tweet.user.handle);

    return $header;
}

//Create the footer for the tweeter page
let createFooter = function (tweet) {
    let timeSinceTweet = ((Date.now() - tweet.created_at) / (1000 * 60 * 60 * 24));
    let flag = false;

    if(timeSinceTweet < 1) {
        timeSinceTweet *= 24;
        flag = true;
    }
    timeSinceTweet = Math.floor(timeSinceTweet);
    let $footer = $("<footer>").addClass("tweet-footer clearfix");

    if(flag) {
        if(timeSinceTweet < 1) {
            $footer.append(`<p> Less than an hour ago...`);
        } else {
            $footer.append("<p> " + timeSinceTweet + " hours old");
        }
    } else {
        $footer.append("<p> " + timeSinceTweet + " days ago");
    }
    let $footerIcons = $("<div>").attr("class", "footer-icons");
    $footerIcons.append("<i class='material-icons'>rotate_left")
    $footerIcons.append("<i class='material-icons heart'>favorite_border")
    $footerIcons.append("<i class='material-icons'>flag")
    $footer.append($footerIcons);

    return $footer;
}

//Create the full for tweet HTML element which is eventually rendered to the page
let createTweetElement = function (tweet) {
    let $tweetArticle = $(`<section class='tweets' id=${tweet._id}>`);
    let $innerArticle = $("<article>");

    let $header = createHeader(tweet);
    $innerArticle.append($header);

    $innerArticle.append("<div class='tweet-body clearfix'><p>" + tweet.content.text);

    let $footer = createFooter(tweet);
    $innerArticle.append($footer);

    $tweetArticle.append($innerArticle);

    return $tweetArticle;
}