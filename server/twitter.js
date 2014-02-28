var TwitterAPI = require('node-twitter-api');

function TwitterClient() {
   this._initialise();
}

TwitterClient.prototype._twitter = null;

TwitterClient.prototype._initialise = function() {
   this._twitter = new TwitterAPI({
       consumerKey: 'vlxvgHPg0lZHxm1wlkrgug',
       consumerSecret: 'bvQgZ1rbWaBpdv60pCakxfCarXvjUtjlOF3BCMdOgA',
       callback: 'http://www.google.co.uk' // doesnt matter
   });
};

TwitterClient.prototype.search = function(term, callback) {
   if (!this._requestToken) {
      this._authenticate(this.search.bind(this, term, callback));
   } else {
      this._twitter.search({
         q: term
       },
       this._requestToken,
       this._requestTokenSecret,
       function(error, data, response) {
           if (!error) {
               console.log(term);
           } else {
               console.log('Error TwitterClient.search failed to perform search for "' + term + '": ' + JSON.stringify(error));
           }
       }.bind(this));
   }
};

TwitterClient.prototype._authenticate = function(callback) {
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


var t = new TwitterClient();
t.search('$TWTR');

module.exports = TwitterClient;





