var TwitterAPI = require('node-twitter-api'),
   twitter = require('ntwitter');

function TwitterHelper(marketIds) {
   this._marketIds = marketIds;
   this._initialise();
}

TwitterHelper.prototype._twitter = null;

TwitterHelper.prototype._initialise = function() {
   this._markets = this._marketIds.reduce(function(obj, marketId) {
      obj[marketId] = 0;
      return obj;
   }, {});

   this._cashTags = this._marketIds.map(function(marketId) {
      return '$' + marketId;
   });
   this._twitter = new TwitterAPI({
      consumerKey: 'vlxvgHPg0lZHxm1wlkrgug',
      consumerSecret: 'bvQgZ1rbWaBpdv60pCakxfCarXvjUtjlOF3BCMdOgA',
      callback: 'http://www.google.co.uk' // doesnt matter
   });
   this._search();
   this._stream();
};

TwitterHelper.prototype._search = function(term, callback) {
   if (!this._requestToken) {
      this._authenticate(this.search.bind(this, term, callback));
   } else {
      this._twitter.search({
            q: this._cashTags.join(' OR ')
         },
         '28787819-5CtzUJEoSTCvdwvbDHjHaml9e8DYaeNKL9wB4vbnj',
         '5iICLywoaQHbm0Wz99l0rPxIXpfcV4O2ekHX43ycFxccy',
         function(error, data, response) {
            if (!error) {
               data.statuses.forEach(this._parseTweet.bind(this));
            } else {
               console.log('Error TwitterClient.search failed to perform search for "' + term + '": ' + JSON.stringify(error));
            }
         }.bind(this));
   }
   return this;
};

TwitterHelper.prototype._stream = function() {
//   this._twitter.getStream('filter',
//      { track: TwitterHelper.CASHTAGS.join(' OR ') },
//      '28787819-5CtzUJEoSTCvdwvbDHjHaml9e8DYaeNKL9wB4vbnj',
//      '5iICLywoaQHbm0Wz99l0rPxIXpfcV4O2ekHX43ycFxccy',
//      function(a, b, c, stream) {
//         console.log(arguments);
//         stream.on('data', function(tweet) {
//            this._parseTweet(tweet);
//            console.log(arguments);
//         }.bind(this));
//
//      }.bind(this),
//      function() {
//         console.log(arguments);
////         setInterval(function() {
////            console.log(this._markets);
////         }.bind(this), 100);
//      }.bind(this));

   var ts = new twitter({
      consumer_key: 'vlxvgHPg0lZHxm1wlkrgug',
      consumer_secret: 'bvQgZ1rbWaBpdv60pCakxfCarXvjUtjlOF3BCMdOgA',
      access_token_key: '28787819-5CtzUJEoSTCvdwvbDHjHaml9e8DYaeNKL9wB4vbnj',
      access_token_secret: '5iICLywoaQHbm0Wz99l0rPxIXpfcV4O2ekHX43ycFxccy'
   });

   ts.stream('statuses/filter', { track: this._cashTags }, function(stream) {
     stream.on('data', function(tweet) {
        this._parseTweet(tweet);
     }.bind(this));
   }.bind(this));
   return this;
};

TwitterHelper.prototype._parseTweet = function(tweet) {
   if (tweet.text) {
      var text = tweet.text.toLowerCase();

      this._cashTags.forEach(function(cashTag, index) {
         if (text.indexOf(cashTag) > -1) {
            this._markets[this._marketIds[index]]++
         }
      }, this);
   }
};

TwitterHelper.prototype._authenticate = function(callback) {
   this._twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results){
      if (!error) {
         this._requestToken = requestToken;
         this._requestTokenSecret = requestTokenSecret;
         callback();
      } else {
         console.log('Error TwitterClient._authenticate failed to retrieve token: ' + JSON.stringify(error));
      }
   }.bind(this));
};

TwitterHelper.prototype.getMarkets = function() {
   return this._markets;
};

module.exports = TwitterHelper;