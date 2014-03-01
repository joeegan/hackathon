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

function TwitterHelper() {
   this._initialise();
}

TwitterHelper.prototype._twitter = null;

TwitterHelper.prototype._markets = null;

TwitterHelper.prototype._marketIds = null;

TwitterHelper.prototype._cashTags = null;

TwitterHelper.prototype._initialise = function() {
   this._markets = {};
   this._marketIds = [];
   this._cashTags = [];
   this._twitter = new TwitterAPI({
      consumer_key: 'vlxvgHPg0lZHxm1wlkrgug',
      consumer_secret: 'bvQgZ1rbWaBpdv60pCakxfCarXvjUtjlOF3BCMdOgA',
      access_token_key: '28787819-5CtzUJEoSTCvdwvbDHjHaml9e8DYaeNKL9wB4vbnj',
      access_token_secret: '5iICLywoaQHbm0Wz99l0rPxIXpfcV4O2ekHX43ycFxccy'
   });
};

TwitterHelper.prototype._search = function(callback) {
   this._twitter.search(this._cashTags.join(' OR '), {}, function(err, data) {
      if (!err) {
         data.statuses.forEach(this._parseTweet.bind(this));
         callback(data);
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
};

TwitterHelper.prototype.get = function(id, callback) {

   var _marketId = id.split('-')[0].toLowerCase(),
      marketId = TwitterHelper.cashMap[_marketId] || _marketId;

   if (this._marketIds.indexOf(marketId) === -1) {
      this._marketIds.push(marketId);
      this._cashTags.push('$' + marketId);
      this._markets[marketId] = {
         count: 0,
         tweets: [],
         index: 0
      };
      this._search(function() {
         callback(this._markets[marketId]);
         this._stream();
      }.bind(this));
   } else {
      callback(this._markets[marketId]);
   }
};

TwitterHelper.prototype._parseTweet = function(tweet) {
   if (tweet.text) {
      var text = tweet.text.toLowerCase();

      this._cashTags.forEach(function(cashTag, index) {
         if (text.indexOf(cashTag) > -1) {
            this._markets[this._marketIds[index]].count++;
            this._markets[this._marketIds[index]].tweets.push(tweet.text);
            this._markets[this._marketIds[index]].index = Math.min(1 + Math.log(this._markets[this._marketIds[index]].count), 10);
         }
      }, this);
   }
};

TwitterHelper.cashMap = {
   'ft100': 'ftse',
   'gc': 'gld',
   'si': 'lsil',
   'wall': 'dji',
   'dete30': 'dax'
};

module.exports = TwitterHelper;