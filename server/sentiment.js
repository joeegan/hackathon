module.exports = function(server, client, log) {

   server.get('/sentiment/:market', function(req, res, next) {

      client.get('/clientsentiment/' + req.params.market, function(result) {
         res.send(result);
         return next();
      }, req);

   });

};