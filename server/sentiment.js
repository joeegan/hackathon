module.exports = function(server, client, log) {

   server.get('/sentiment/:market', function(serverReq, serverRes, next) {

      client.get({
         path: 'https://web-api.ig.com/gateway/deal/clientsentiment/' + serverReq.params.market,
         headers: {
            'X-SECURITY-TOKEN': serverReq.headers['x-security-token'],
            'CST': serverReq.headers['cst']
         }
      }, function(err, clientReq, clientRes) {
         serverRes.send(clientRes.body);
         return next();
      });

   });

};