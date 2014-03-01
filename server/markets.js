module.exports = function(client, log) {
   var MarketHelper = require('./markethelper'),
      marketHelper = new MarketHelper(client);

   function compute(req, res, next, callback) {
      marketHelper.getMarkets(req).then(function(markets) {
         callback(JSON.stringify(markets));
      });
   }

   return {
      compute: compute,
      serve: function(server) {
         server.get('/markets', function(req, res, next) {
            compute(req, res, next, function(markets) {
               res.send(200, markets);
               return next();
            });
         });
      }
   };


};