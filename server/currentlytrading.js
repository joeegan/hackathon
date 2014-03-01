/**
 * Takes the client's open positions and working order
 * Weighting is higher if the quantity of combined orders & positions is highest
 */
module.exports = function(client, log) {

//   function compute(req, res, next, epic, callback) {
//
//      function loadMarketId(cb) {
//         client.get('/markets/' + epic, function(result) {
//            cb(result.instrumentData.marketId);
//         }, req);
//      }
//
//      loadMarketId(function(marketId) {
//         client.get('/clientsentiment/' + marketId, function(result) {
//            if (!result || !result.longPositionPercentage) {
//               res.send(400);
//               return next();
//            }
//            callback(Math.abs(result.longPositionPercentage - result.shortPositionPercentage) / 10);
//         }, req);
//      })
//   }

   return {
      compute: function(){},
      serve: function(server) {
         server.get('/positions', function(req, res, next) {
            res.send(200, 'foo');
//            compute(req, res, next, req.params.epic, function(index) {
//            });
            return next();
         });
      }
   };

};