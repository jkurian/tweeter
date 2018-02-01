"use strict";

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
    
    saveLikes: function (likes, UUID, callback) {
      let tweets = db.collection("tweets").find().toArray((err, tweets) => {
        console.log("tweets = ", tweets);
        let updatedTweet = '';
        for(let tweet in tweets) {
          console.log("tweetOBj = ", tweet);
          console.log("UUID, TARGET UUID", tweets[tweet].UUID, UUID)
          if(tweets[tweet].UUID == UUID) {
            console.log("trying to update mongodb")
            db.collection("tweets").update({UUID: UUID}, {$set: {likes: ++likes}});
            updatedTweet = tweets[tweet];
          }
        }
        callback(updatedTweet, null);

      } );
    },

    generateUUID: function() {
      function generateRandomString() {
        let rand = Math.floor(Math.random() * 100000000).toString();
        console.log(rand.hashCode());
        return rand.hashCode();
    }
    
    //default hash function implemented in javas .toHash function
    //returns a string from the hashed value
    String.prototype.hashCode = function () {
        let hash = 0;
        if (this.length == 0) return hash;
        for (let i = 0; i < this.length; i++) {
            let char = this.charCodeAt(i);
            let rand = Math.floor(Math.random() * 100);
            hash = ((hash << 5) - hash) + char - rand;
            hash = Math.abs(hash & hash); // Convert to 32bit integer
        }
        return hash.toString(32);
    }
    return generateRandomString();
    }

  };
}