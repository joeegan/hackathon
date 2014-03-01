var Q = require('noq');

function WatchlistHelper(client) {
   this._client = client;
}

WatchlistHelper.prototype.getMarkets = function(req) {
   this._req = req;
   this._deferred = Q.defer();
   this._processMarkets();
   return this._deferred.promise;
};

WatchlistHelper.prototype._processMarkets = function() {
   this._getUserWatchlists()
      .then(this._getUserMarkets.bind(this));
};

WatchlistHelper.prototype._getUserWatchlists = function() {
   var deferred = Q.defer();
   this._client.get('/watchlists', function(resp) {
      var editableWatchlists = resp.watchlists.reduce(function(result, watchlist) {
         if (!!watchlist.editable) {
            result.push(watchlist.id);
         }
         return result;
      }, []);
      deferred.resolve(editableWatchlists);
   }, this._req);
   return deferred.promise;
};

WatchlistHelper.prototype._getUserMarkets = function(editableWatchlists) {
   var result = [];

   editableWatchlists.forEach(function(id) {

      this._client.get('/watchlists/' + id, function(id, resp) {
         resp.markets.reduce(function(epics, market) {
            if (epics.indexOf(market.epic) === -1) {
               result.push({
                  epic: market.epic,
                  name: market.instrumentName
               });
               epics.push(market.epic);
            }
            return epics;
         }, []);

         editableWatchlists.splice(editableWatchlists.indexOf(id), 1);

         if (!editableWatchlists.length) {
            this._deferred.resolve(result);
         }
      }.bind(this, id), this._req);
   }, this);
};

module.exports = WatchlistHelper;

