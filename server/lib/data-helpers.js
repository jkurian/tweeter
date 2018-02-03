"use strict";
var ObjectId = require('mongodb').ObjectID;
// Defines helper functions for saving and getting tweets, using the database `db`
module.exports = function makeDataHelpers(db) {
  return {

    // Saves a tweet to `db`
    saveTweet: function (newTweet, callback) {
      if (newTweet) return;
      db.collection("tweets").insertOne(newTweet);
      callback(null, true);
    },

    // Get all tweets in `db`, sorted by newest first
    getTweets: function (callback) {
      db.collection("tweets").find().toArray((err, tweets) => {
        if (err) {
          return callback(err, null);
        }

        tweets.sort((a, b) => {
          return b.created_at - a.created_at
        })
        callback(null, tweets);
      });

    },

    //Find the tweet to update with the specified ID and set its likes to value
    //passed to the function
    updateLikes: function (id, likes, callback) {
      db.collection("tweets").update({
        "_id": ObjectId(id)
      }, {
        $set: {
          likes: likes
        }
      });
      //Refactor, not sure why this is here. Eventually I will have to check if 
      //the user has liked a tweet already to see if we should increment or
      //decrement the likes
      db.collection("tweets").find({
        "_id": ObjectId(id)
      }).toArray((err, tweets) => {
        console.log(tweets);
      });
      callback(null);
    },

    //Returns all the users in the database
    getUsers: function (callback) {

      db.collection("user-data").find().toArray((err, users) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, users);
        }
      })
    },

  };
}