module.exports = function(client, log) {
   var TwitterHelper = require('./twitterHelper');

   function compute(req, res, next, epic, callback) {
      function loadMarketId(callback) {
         client.get('/markets/' + req.params.epic, function(result) {
            callback(result.instrumentData.marketId);
         }, req);
      }

      loadMarketId(function(marketId) {
         marketId = marketId.split('-')[0].toLowerCase();
         var twitter = new TwitterHelper(marketId);

         // TODO - this needs to be async
         res.send(200, twitter.getMarkets());

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





