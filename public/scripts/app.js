// const flash = require('flash-message');
/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */

$(document).ready(function () {
    loadTweets();

    //Event hanlder for submit on the tweet form
    $(".new-tweet form").submit(function (event) {
        event.preventDefault();

        //Should I use this here? Maybe refactor
        let tweetBody = $('.new-tweet form textarea[name="tweetText"]').val();
        //If the tweetBody is null or an empty string we do not make the POST request
        if (!tweetBody) {
            $.flash("You cant tweet nothing!");
            return;
        }
        //Alert the user if their tweet is too long or empty and return
        if (tweetBody.length > 140) {
            $.flash("Your tweet is too long!")
            return;
        }

        //If we get here, the tweet is valid and we can make the POST request which is
        //within the postNewTweet method
        postNewTweet(escape(tweetBody));
    })

    //On click hander which hides the compose tweet section which clicked
    //If the .new-tweet section is visible, we set it to focus so the client
    //can begin typing their tweet immediately. We first check if the user is 
    //logged in.
    $("#nav-bar .compose").on('click', function (event) {
        $.get('/tweets/allowed/', function (status) {
            if (status.status) {
                $(".new-tweet").slideToggle("slow", () => {
                    if ($(".new-tweet").is(':visible')) {
                        $(".new-tweet form textarea").focus();
                    }
                });
            } else {
                $.flash("Please login first!");
            }
        })
    })

    //on click for the register button
    $('#nav-bar .register').on('click', function () {
        $.flash("Feature not implemented yet");
    })

    //on click for the login button in the navbar. Basically just shows the form.
    $("#nav-bar .login").on('click', function (event) {
        $(".login-form").slideToggle("slow", () => {
            if ($(".login-form").is(':visible')) {
                $(".login-form textarea").focus();
            }
        });
    });

    //Submits the login info. 
    $('.login-form > button').on('click', function (event) {
        $('#login-info').submit();
    })

    //Logs the user out on click
    $('#nav-bar .logout').on('click', function (event) {
        event.preventDefault();
        console.log("logging out");
        $.get('/tweets/logout', function () {
            console.log("successfully logged out");
            $('.login-register > .logout').hide();
            $('.login-register > .login').show();
            $('.login-register > .register').show();
        })
    })

    //Sets up the page on document ready to show the correct HTML
    $.get("/tweets/allowed", function (status) {
        if (status.status) {
            console.log("removing login and register")
            $('.login-register > .login').hide();
            $('.login-register > .register').hide();
            $('.login-register > .logout').show();
            // $('.login-register button .register').hide();
        } else {
            $('.login-register > .logout').hide();
            $('.login-register > .login').show();
            $('.login-register > .register').show();
        }
    })
});

//POST request to add new tweet to mongo database (tweets collection)
let postNewTweet = function (tweetBody) {
    //To pass to the post for writing the tweet
    let tweetText = {
        text: tweetBody
    }
    //On completion of adding the tweet, we clear the tweets, reload them and add animations
    //Could also just prepend the new tweet (will implement later)
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

//Removes all the tweets from the HTML
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

//Updates the likes of the tweet clicked by the client. We first check if they are logged in or not
//if they are
let updateLike = function (tweet, $tweetElement) {
    $.get('/tweets/allowed/', function (status) {
        if (status.status) {
            let tweetInfo = {
                _id: tweet._id,
                likes: tweet.likes
            }
            $.get('/tweets/liked-status', tweetInfo, function (hasLiked) {
                console.log("callback", hasLiked)
            })
            let id = $tweetElement.attr('id');
            if ($tweetElement.data('liked')) {
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

            let tweetObj = {
                _id: tweet._id,
                likes: tweet.likes
            }
            //This should be a PUT
            $.post('/tweets/likes/', tweetObj, function () {
                console.log('updated database');
            })
        } else {
            console.log("log in first!");
            $.flash("Log in first!")
        }
    })
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

    if (timeSinceTweet < 1) {
        timeSinceTweet *= 24;
        flag = true;
    }
    timeSinceTweet = Math.floor(timeSinceTweet);
    let $footer = $("<footer>").addClass("tweet-footer clearfix");

    if (flag) {
        if (timeSinceTweet < 1) {
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