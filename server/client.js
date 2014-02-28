module.exports = function(log) {

   var restify = require('restify');
      client = restify.createJsonClient({
         url: 'https://web-api.ig.com/gateway/deal',
         headers: {
            'Accept': 'application/json; charset=UTF-8',
            'Content-Type': 'application/json; charset=UTF-8',
            'X-IG-API-KEY': '9326651ab2bae60b2fc6',
            'X-IG-VENDOR': '9326651ab2bae60b2fc6'
         },
         log: log
      });

   return {
      post: function(path, data, callback, request) {
         client.post({
            path: 'https://web-api.ig.com/gateway/deal/' + path/*,
            headers: {
               'X-SECURITY-TOKEN': request.headers['x-security-token'],
               'CST': request.headers['cst']
            }*/
         }, data, function(_err, _req, res) {
            callback(res.body);
         });
      },
      get: function(path, callback, request) {
         client.get({
            path: 'https://web-api.ig.com/gateway/deal/' + path,
            headers: {
               'X-SECURITY-TOKEN': request.headers['x-security-token'],
               'CST': request.headers['cst']
            }
         }, function(_err, _req, res) {
            callback(res.body);
         });
      }
   };

};