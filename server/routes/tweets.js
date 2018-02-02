"use strict";

const userHelper = require("../lib/util/user-helper")

const express = require('express');
const tweetsRoutes = express.Router();
//May or may not need these in this file
// const cookieSession = require('cooke-session');
// const bcrypt = require('bcrypt');

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

  tweetsRoutes.post("/login", function (req, res) {

  });

  return tweetsRoutes;

}