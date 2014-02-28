module.exports = function(server, client, log) {

   server.get('/sentiment/:epic', function(req, res, next) {

      function loadMarketId(callback) {
         client.get('/markets/' + req.params.epic, function(result) {
            callback(result.instrumentData.marketId);
         }, req);
      }

      loadMarketId(function(marketId) {
         client.get('/clientsentiment/' + marketId, function(result) {

            if (!result.longPositionPercentage) {
               res.send(400);
               return next();
            }

            result.index = Math.abs(result.longPositionPercentage - result.shortPositionPercentage) / 10;
            
            res.send(200, result);
            return next();
         }, req);
      })

   });

};