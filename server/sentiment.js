module.exports = function(server, client, log) {

   server.get('/sentiment/:market', function(req, res, next) {

      client.get('/clientsentiment/' + req.params.market, function(result) {

         result.index = Math.abs(result.longPositionPercentage - result.shortPositionPercentage) / 10;

         res.send(200, result);
         return next();
      }, req);

   });

};