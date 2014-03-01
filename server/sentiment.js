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
         client.get('/clientsentiment/' + marketId, function(result) {
            if (!result || !result.longPositionPercentage) {
               res.send(400);
               return next();
            }
            callback(Math.abs(result.longPositionPercentage - result.shortPositionPercentage) / 10);
         }, req);
      })
   }

   return {
      compute: compute,
      serve: function(server) {
         server.get('/sentiment/:epic', function(req, res, next) {
            compute(req, res, next, req.params.epic, function(index) {
               res.send(200, index);
               return next();
            });
         });
      }
   };

};