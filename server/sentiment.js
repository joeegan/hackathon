module.exports = function(server, client, log) {

   server.get('/sentiment', function(serverReq, serverRes, next) {

      serverRes.send('ok');
      return next();
   });

};