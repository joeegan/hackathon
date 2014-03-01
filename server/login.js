module.exports = function(client, log) {

   return {
      serve: function(server) {
         server.post('/login', function(req, res, next) {
            client.post('/session', {
               identifier: req.body.identifier,
               password: req.body.password
            }, function(result, headers) {
               result['CST'] = headers['cst'];
               result['X-SECURITY-TOKEN'] = headers['x-security-token'];
               res.send(200, result);
               return next();
            });
         });
      }
   };

};