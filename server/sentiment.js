module.exports = function(server, client) {

   server.get('/sentiment', function(req, res, next) {
      client.post('/session', {
    "identifier": "SelTESTigm2602PqK",
    "password": "112233"
}, function(err, req, res, obj) {
      res.send(obj);
         return next();
      });
   });
};