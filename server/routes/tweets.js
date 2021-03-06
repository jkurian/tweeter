"use strict";

const userHelper = require("../lib/util/user-helper")
const express = require('express');
const tweetsRoutes = express.Router();
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

module.exports = function (DataHelpers) {

  //Gets the tweets in the database 
  tweetsRoutes.get("/", function (req, res) {
    DataHelpers.getTweets((err, tweets) => {
      if (err) {
        res.status(500).json({
          error: err.message
        });
      } else {
        res.json(tweets);
      }
    });
  });

  //Generate the tweet, we use the req.body passed to this POST.
  //If you trace it back, you will see we pass in an object with
  //Only a text key which contains the tweet body value (what we are actually tweeting)
  tweetsRoutes.post("/", function (req, res) {
    console.log('posted tweet route');
    if (!req.body.text) {
      res.status(400).json({
        error: 'invalid request: no data in POST body'
      });
      return;
    }
    const user = req.body.user ? req.body.user : userHelper.generateRandomUser();
    const tweet = {
      user: user,
      content: {
        text: req.body.text
      },
      created_at: Date.now(),
      likes: 0
    };
    console.log("going to save tweet to db")
    DataHelpers.saveTweet(tweet, (err) => {
      if (err) {
        res.status(500).json({
          error: err.message
        });
      } else {
        console.log("saving tweet")
        res.status(201).send();
      }
    });

  });

  //If the user tries to like a post by clicking it, first check if they are logged in,
  //If they are, we update the database which stores the tweets and likes and send back
  //a status 200 response
  tweetsRoutes.post('/likes', function (req, res) {
    if (!req.session.userID) {
      console.log("LOG IN FIRST!");
      res.status(404).send();
    } else {
      DataHelpers.updateLikes(req.body._id, req.body.likes, (err) => {
        if (err) {
          res.status(500).json({
            error: err.message
          });
        } else {
          res.status(201).send();
        }
      })
    }
  })

  //Route to check if the user is logged in or not. If the cookie session has a 
  //userID, then we allow the client to like and compose tweets.
  tweetsRoutes.get('/allowed', function (req, res) {
    console.log("in allowed route");
    if (req.session.userID) {
      res.json({
        status: true
      });
    } else {
      res.json({
        status: false
      });
    }
  })

  //When the user logs out, we clear the session
  tweetsRoutes.get("/logout", function (req, res) {
    console.log('in logout route');
    req.session = null;
    res.redirect('/')
  })

  //Logs the user in, if they pass the correct password and email combination, then we 
  //set the cookie session userID.
  tweetsRoutes.post("/login", function (req, res) {
    console.log("log in route", req.body);

    let attemptLogin;
    let keyForUserInfo;
    let flag = false;

    //Get the users 
    DataHelpers.getUsers((err, users) => {
        if (err) {
          res.status(500).json({
            error: err.message
          });
        } else {
          console.log(users);
          //First find the users email from the database returned from getUsers
          for (let userObject of users) {
            let userInfoKey = Object.keys(userObject)[1];
            let emailOfUserObj = userObject[userInfoKey].email;
            if (req.body.email === emailOfUserObj) {
              console.log("Found email");
              attemptLogin = userObject;
              keyForUserInfo = userInfoKey;
              flag = true;
              break;
            }
          }
          //If an email was not found or the password does not match, we return with a 404. If
          //the email and password match, we set the cookie session and return a 403.
          if (!flag) {
            console.log("login failed")
            res.status(404).redirect("/");
          } else if (req.body.password !== attemptLogin[keyForUserInfo].password) {
            console.log("Wrong password");
            res.status(404).redirect("/");
          } else {
            console.log("SUCCESS!");
            req.session.userID = attemptLogin._id;
            res.status(403).redirect("/")
          }
        }
      }),

      tweetsRoutes.get("/liked-status", function (req, res) {
        console.log('liked status route');
        DataHelpers.getUsers((err, users) => {
          if (err) {
            res.status(500).json({
              error: err.message
            });
          } else {
            for (let user of users) {
              console.log('user: ', user._id, req.session.userID, user.tweetsLiked[req.body._id], user);
              if (user._id == req.session.userID && (user.tweetsLiked[req.body._id] != 'true')) {
                console.log("liking");
                user.tweetsLiked[req.body._id] = 'true';
                res.status(200).json({
                  liked: false
                })
                break;
              } else {
                console.log('false');
                user.tweetsLiked[req.body._id] = 'false';
                res.status(200).json({
                  liked: true
                })
                break;
              }
            }
          }
        });
      });
  });
  return tweetsRoutes;

}