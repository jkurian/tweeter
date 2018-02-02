"use strict";

const userHelper = require("../lib/util/user-helper")

const express = require('express');
const tweetsRoutes = express.Router();
//May or may not need these in this file
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

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
    DataHelpers.updateLikes(req.body._id, req.body.likes, (err) => {
      if (err) {
        res.status(500).json({
          error: err.message
        });
      } else {
        res.status(201).send();
      }
    })
  })

  tweetsRoutes.get("/login", function (req, res) {
    console.log("log in route");
    delete req.session.user_id;

    let attemptLogin;
    let flag = false;

    //Need database of users GET. then parse to try to find the user
    //HAVE TO MAKE THIS DATA HELPER
    DataHelpers.getUsers((err, users) => {
      if (err) {
        res.status(500).json({
          error: err.message
        });
      } else {
        for (let user in users) {
          if (users[user].email === req.body.email) {
              attemptLogin = users[user]; //get the user object
              flag = true;
              break;
          }
      }
      }
    });
    
    return res.status(200);
  });

  return tweetsRoutes;

}