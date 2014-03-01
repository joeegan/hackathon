/**
* Takes the client sentiment for a market
* Weighting is higher when there is a large percentage in one direction
*/
module.exports = function(client, log) {

   function compute(req, res, next, epic, callback) {

      function loadMarketId(cb) {
         client.get('/markets/' + epic, function(result) {
            cb(result.instrumentData.marketId);
         }, req);
      }

      loadMarketId(function(marketId) {
         client.get('/clientsentiment/related/' + marketId, function(result) {
            if (!result || !result.clientSentiments) {
               res.send(400);
               return next();
            }
            callback(result.clientSentiments.map(function(item) { return item.marketId; }));
         }, req);
      })
   }

   return {
      compute: compute,
      serve: function(server) {
         server.get('/related/:epic', function(req, res, next) {
            compute(req, res, next, req.params.epic, function(data) {
               res.send(200, data);
               return next();
            });
         });
      }
   };

};