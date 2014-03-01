module.exports = function(server, client, log) {
   var MarketHelper = require('./markethelper'),
      marketHelper = new MarketHelper(client);

   server.get('/markets', function(req, res, next) {

      marketHelper.getMarkets(req).then(function(markets) {
         var json = JSON.stringify(markets);
         res.send(json);
         return next();
      });

   });

};