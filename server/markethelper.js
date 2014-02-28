var Q = require('noq');

function MarketHelper(client) {
   this._client = client;
}

MarketHelper.prototype.getMarkets = function() {
   this._deferred = Q.defer();
   this._processMarkets();
   return this._deferred.promise;
};

MarketHelper.prototype._processMarkets = function() {
   this._getUserWatchlists()
      .then(this._getUserMarkets.bind(this));
};

MarketHelper.prototype._getUserWatchlists = function() {
   var deferred = Q.defer();
   this._client.get('/watchlists', function(resp) {
      var editableWatchlists = resp.watchlist.map(function(watchlist) {
         if (!!watchlist.editable) {
            return watchlist.id;
         }
      });
      deferred.resolve(editableWatchlists);
   });
   return deferred.promise;
};

MarketHelper.prototype._getUserMarkets = function(editableWatchlists) {
   var result = [];

   editableWatchlists.forEach(function(id) {
      this._client.get('/watchlists/' + id, function(id, resp) {
         resp.markets.forEach(function(market) {
            if (result.indexOf(market) == -1) {
               result.push(market);
            }
         }, this);

         editableWatchlists.splice(editableWatchlists.indexOf(id), 1);

         if (!editableWatchlists.length) {
            this._deferred.resolve(result);
         }
      }.bind(this, id));
   }, this);
};

module.exports = MarketHelper;

