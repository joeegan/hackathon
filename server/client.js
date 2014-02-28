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

   function parseHeaders(request) {
      if (request && request.headers) {
         return {
            'X-SECURITY-TOKEN': request.headers['x-security-token'],
            'CST': request.headers['cst']
         };
      }
      return {};
   }

   function proxy(fn, path, data, callback, request) {

      // here be dragons

      var args = [],
         headers,
         d,
         cb;

      if (request !== undefined) {
         headers = parseHeaders(request);
      } else if (callback !== undefined && typeof callback !== 'function') {
         headers = parseHeaders(callback);
      }

      args.push({
         path: 'https://web-api.ig.com/gateway/deal' + path,
         headers: headers
      });

      if (data !== undefined && typeof data !== 'function') {
         d = data;
      }

      if (typeof data === 'function') {
         cb = data;
      } else if (typeof callback === 'function') {
         cb = callback;
      }

      if (d !== undefined) {
         args.push(d);
      }

      if (cb !== undefined) {
         args.push(function(_err, _req, res) {
            if (cb) {
               cb(res.body);
            }
         });
      }

      fn.apply(client, args);
   }

   return {
      post: proxy.bind(null, client.post),
      get: proxy.bind(null, client.get)
   };

};