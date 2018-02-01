"use strict";
var ObjectId = require('mongodb').ObjectID;
// Defines helper functions for saving and getting tweets, using the database `db`
module.exports = function makeDataHelpers(db) {
  return {

    // Saves a tweet to `db`
    saveTweet: function (newTweet, callback) {
      db.collection("tweets").insertOne(newTweet);
      callback(null, true);
    },

    // Get all tweets in `db`, sorted by newest first
    getTweets: function (callback) {
      db.collection("tweets").find().toArray((err, tweets) => {
        if (err) {
          return callback(err);
        }
        tweets.sort((a,b) => {
          return b.created_at - a.created_at
        })
        callback(null, tweets);
      });

    },

    updateLikes: function(id, likes, callback) {
      //updateDB here
      db.collection("tweets").update({"_id": ObjectId(id)},{$set: {likes: likes}});

      db.collection("tweets").find({"_id": ObjectId(id)}).toArray((err, tweets) => {
        console.log(tweets);
      });
      callback(null);
    }

  };
}