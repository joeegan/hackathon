module.exports = function(server, client, log) {

   server.post('/login', function(serverReq, serverRes, next) {

      client.post({
         path: 'https://web-api.ig.com/gateway/deal/session'
      }, {
         identifier: serverReq.body.identifier,
         password: serverReq.body.password
      }, function(err, clientReq, clientRes) {
         serverRes.send(clientRes.body);
         return next();
      });

   });

};