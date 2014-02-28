module.exports = function(server, client, log) {
   var MarketHelper = require('./markethelper'),
      marketHelper = new MarketHelper(client);

   server.get('/markets', function(req, res, next) {

      marketHelper.getMarkets().then(function(markets) {
         var json = JSON.stringify(markets);
         log(json);
         res.send(200, json);
         return next();
      });

   });

};