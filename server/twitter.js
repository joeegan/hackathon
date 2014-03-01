/**
* Takes the twitter activity for a market
* Weighting is higher when there are more tweets about the market. It's a logarithmic scale
*/
module.exports = function(client, log) {

   var TwitterHelper = require('./twitterHelper'),
      twitter = new TwitterHelper();

   function compute(req, res, next, epic, callback) {

      function loadMarketId(cb) {
         client.get('/markets/' + epic, function(result) {
            cb(result.instrumentData.marketId);
         }, req);
      }

      loadMarketId(function(marketId) {
         twitter.get(marketId, function(tweets) {
            callback(tweets);
         });
      })
   }

   return {
      compute: compute,
      serve: function(server) {
         server.get('/twitter/:epic', function(req, res, next) {
            compute(req, res, next, req.params.epic, function(data) {
               res.send(200, data);
               return next();
            });
         });
      }
   };

};