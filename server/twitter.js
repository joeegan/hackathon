module.exports = function(client, log) {
   var TwitterHelper = require('./twitterHelper'),
      twitter = new TwitterHelper();

   function compute(req, res, next, epic, callback) {
      function loadMarketId(callback) {
         client.get('/markets/' + req.params.epic, function(result) {
            callback(result.instrumentData.marketId);
         }, req);
      }

      loadMarketId(function(marketId) {
         marketId = marketId.split('-')[0].toLowerCase();
         twitter.get(marketId, function(tweets) {
            res.send(200, tweets);
         });

         return next();
      });
   }

   return {
      compute: compute,
      serve: function(server) {
         server.get('/twitter/:epic', function(req, res, next) {
            compute(req, res, next, req.params.epic, function(markets) {
               res.send(200, markets);
               return next();
            });
         });
      }
   };

};





