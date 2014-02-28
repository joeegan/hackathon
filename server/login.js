module.exports = function(server, client, log) {

   server.post('/login', function(req, res, next) {

      client.post('/session', {
         identifier: req.body.identifier,
         password: req.body.password
      }, function(result) {
         res.send(result);
         return next();
      });

   });

};