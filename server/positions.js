module.exports = function(server, client, log) {

   server.get('/positions', function(req, res, next) {

      client.get('/positions', function(result) {
         res.send(result);
         return next();
      }, req);

   });

};