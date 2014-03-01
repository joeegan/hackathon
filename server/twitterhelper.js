var TwitterAPI = require('ntwitter');

/*** HACK FOR ntwitter ***/

TwitterAPI.prototype.search = function(q, params, callback) {
   if (typeof params === 'function') {
      callback = params;
      params = {};
   }

   if ( typeof callback !== 'function' ) {
      throw new Error('FAIL: INVALID CALLBACK.');
      return this;
   }

   var url = 'https://api.twitter.com/1.1/search/tweets.json';
   params.q = q;
   this.get(url, params, callback);
   return this;
};

/*** HACK ENDS ***/

function TwitterHelper(marketIds) {
   this._marketIds = [].concat(marketIds);
   this._initialise();
}

TwitterHelper.prototype._twitter = null;

TwitterHelper.prototype._markets = null;

TwitterHelper.prototype._marketIds = null;

TwitterHelper.prototype._cashTags = null;

TwitterHelper.prototype._initialise = function() {
   this._markets = this._marketIds.reduce(function(obj, marketId) {
      obj[marketId] = {
         count: 0,
         tweets: [],
         index: 0
      };
      return obj;
   }, {});

   this._cashTags = this._marketIds.map(function(marketId) {
      return '$' + marketId;
   });

   this._twitter = new TwitterAPI({
      consumer_key: 'vlxvgHPg0lZHxm1wlkrgug',
      consumer_secret: 'bvQgZ1rbWaBpdv60pCakxfCarXvjUtjlOF3BCMdOgA',
      access_token_key: '28787819-5CtzUJEoSTCvdwvbDHjHaml9e8DYaeNKL9wB4vbnj',
      access_token_secret: '5iICLywoaQHbm0Wz99l0rPxIXpfcV4O2ekHX43ycFxccy'
   });
   this._search();
   this._stream();
};

TwitterHelper.prototype._search = function() {
   this._twitter.search(this._cashTags.join(' OR '), {}, function(err, data) {
      if (!err) {
         data.statuses.forEach(this._parseTweet.bind(this));
      } else {
         console.log('Error TwitterClient.search failed to perform search for "' + this._cashTags.join(' OR ') + '": ' + JSON.stringify(err));
      }
   }.bind(this));
};

TwitterHelper.prototype._stream = function() {
   this._twitter.stream('statuses/filter', { track: this._cashTags }, function(stream) {
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
            this._markets[this._marketIds[index]].count++;
            this._markets[this._marketIds[index]].tweets.push(tweet.text);
            this._markets[this._marketIds[index]].index; // TODO
         }
      }, this);
   }
};

TwitterHelper.prototype.getMarkets = function() {
   return this._markets;
};

module.exports = TwitterHelper;