module.exports = function(server, client, log) {
   var TwitterHelper = require('./twitterHelper');
   server.get('/twitter/:epic', function(req, res, next) {

      function loadMarketId(callback) {
         client.get('/markets/' + req.params.epic, function(result) {
            console.log(JSON.stringify(result));
            callback(result.instrumentData.marketId);
         }, req);
      }

      loadMarketId(function(marketId) {
         var twitter = new TwitterHelper([marketId]);
         res.send(200, twitter.getMarkets());
         return next();
      });

   });

};





