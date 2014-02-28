module.exports = function(server, client) {

   var assert = require('assert');

   server.post('/login', function(req, res) {

      client.post('/session', {
         identifier: req.body.identifier,
         password: req.body.password
      }, function(err, req, res, obj) {

         log.info(obj);

         assert.ifError(err);

         req.on('result', function(err, res) {
            assert.ifError(err);
            res.body = '';
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
               res.body += chunk;
            });

            res.on('end', function() {
               console.log(res.body);
            });
         });

         req.write('hello world');
         req.end();
      });
   });
};