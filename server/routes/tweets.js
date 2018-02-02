"use strict";

const userHelper = require("../lib/util/user-helper")

const express = require('express');
const tweetsRoutes = express.Router();
//May or may not need these in this file
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

  tweetsRoutes.post("/", function (req, res) {
    if (!req.body.text) {
      res.status(400).json({
        error: 'invalid request: no data in POST body'
      });
      return;
    }
    //Generate the tweet, we use the req.body passed to this POST.
    //If you trace it back, you will see we pass in an object with
    //Only a text key which contains the tweet body value (what we are actually tweeting)
    const user = req.body.user ? req.body.user : userHelper.generateRandomUser();
    const tweet = {
      user: user,
      content: {
        text: req.body.text
      },
      created_at: Date.now(),
      likes: 0
    };

    DataHelpers.saveTweet(tweet, (err) => {
      if (err) {
        res.status(500).json({
          error: err.message
        });
      } else {
        res.status(201).send();
      }
    });

  });

  tweetsRoutes.post('/likes', function (req, res) {
    if (!req.session.userID) {
      console.log("LOG IN FIRST!");
      res.status(404).send();
    } else {
      console.log("UPDATING LIKES");
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

  tweetsRoutes.get("/logout", function (req, res) {
    console.log('in logout route');
    req.session = null;
    res.redirect('http://localhost:3000')
  })

  tweetsRoutes.post("/login", function (req, res) {
    console.log("log in route", req.body);
    // delete req.session.user_id;

    let attemptLogin;
    let keyForUserInfo;
    let flag = false;

    //Need database of users GET. then parse to try to find the user
    //HAVE TO MAKE THIS DATA HELPER
    DataHelpers.getUsers((err, users) => {
      if (err) {
        res.status(500).json({
          error: err.message
        });
      } else {
        console.log(users);
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

        if (!flag) {
          console.log("login failed")
          res.status(404).redirect("http://localhost:3000");
        } else if (req.body.password !== attemptLogin[keyForUserInfo].password) {
          console.log("Wrong password");
          res.status(404).redirect("http://localhost:3000");
          // for (let user in users) {
          //   for(let userInfo of user) {
          //     console.log(user[userInfo])
          //     if (user[userInfo].email === req.body.email) {
          //       attemptLogin = users[user]; //get the user object
          //       flag = true;
          //       console.log("Found user!", users[user].email)
          //       break;
          //     }

          //   }
        } else {
          console.log("SUCCESS!");
          req.session.userID = attemptLogin._id;
          res.status(403).redirect("http://localhost:3000")
        }
      }
    });
  });

  return tweetsRoutes;

}