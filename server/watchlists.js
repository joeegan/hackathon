module.exports = function(client, log) {
   var WatchlistHelper = require('./watchlisthelper'),
      watchlistHelper = new WatchlistHelper(client);

   function compute(req, res, next, callback) {
      watchlistHelper.getMarkets(req).then(function(markets) {
         callback(markets.slice(0,10));
      });
   }

   return {
      compute: compute,
      serve: function(server) {
         server.get('/watchlists', function(req, res, next) {
            compute(req, res, next, function(markets) {
               res.send(200, markets);
               return next();
            });
         });
      }
   };


};