/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */
let tweetObj = {
    "user": {
      "name": "Newton",
      "avatars": {
        "small":   "https://vanillicon.com/788e533873e80d2002fa14e1412b4188_50.png",
        "regular": "https://vanillicon.com/788e533873e80d2002fa14e1412b4188.png",
        "large":   "https://vanillicon.com/788e533873e80d2002fa14e1412b4188_200.png"
      },
      "handle": "@SirIsaac"
    },
    "content": {
      "text": "If I have seen further it is by standing on the shoulders of giants"
    },
    "created_at": 1461116232227
  };
$(document).ready( function () {
    $(".container").append(createTweetElement(tweetObj));
    $(".tweets").hover( function () {
        $("#footer-icons").toggleClass("animated bounce");
        $(this).toggleClass("animated bounce");
    })
}) 

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
