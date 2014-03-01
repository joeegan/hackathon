/**
* Takes the client sentiment for a market
* Weighting is higher when there is a large percentage in one direction
*/

function compute(req, res, next, epic, callback) {

   function loadMarketId(cb) {
      client.get('/markets/' + req.params.epic, function(result) {

         if (!result || !result.instrumentData) {
            res.send(400);
            return next();
         }

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

function serve(server, client, log) {

   server.get('/sentiment/:epic', function(req, res, next) {
      compute(req, res, next, req.params.epic, function(index) {
         res.send(200, index);
         return next();
      });
   });
}

module.exports = {
   serve: serve,
   compute: compute
}
