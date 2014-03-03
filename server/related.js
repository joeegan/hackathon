/**
* Takes the client sentiment for a market
* Weighting is higher when there is a large percentage in one direction
*/
module.exports = function(client, log) {

   function compute(req, res, next, epic, callback) {

      var allMarkets = [];

      function loadMarketId(cb) {
         client.get('/markets/' + epic, function(result) {
            cb(result.instrumentData.marketId);
         }, req);
      }

      function loadMarkets(marketId, cb) {
         client.get('/markets?q=' + marketId, function(result) {
            var mkts = (result && result.markets) ? result.markets : [];
            cb(mkts);
         }, req);
      }

      function finito() {

         var finalMarkets = [],
            mktEpic,
            marketMap = {},
            filteredMarkets;

         filteredMarkets = allMarkets.filter(function(item) {
            return item.instrumentType == 'CURRENCIES' || item.instrumentType == 'INDICES';
         }).forEach(function(item) {
            marketMap[item.epic] = item.instrumentName;
         });

         for (mktEpic in marketMap) {
            finalMarkets.push({
               epic: mktEpic,
               name: marketMap[mktEpic]
            });
         }

         callback(finalMarkets);
      }

      loadMarketId(function(marketId) {
         client.get('/clientsentiment/related/' + marketId, function(result) {
            if (!result || !result.clientSentiments) {
               res.send(400);
               return next();
            }

            var marketIds = result.clientSentiments.map(function(item) { return item.marketId; });

            loadMarkets(marketIds[Math.floor(Math.random()*marketIds.length)], function(markets) {
               allMarkets = allMarkets.concat(markets);
               loadMarkets(marketIds[Math.floor(Math.random()*marketIds.length)], function(markets) {
                  allMarkets = allMarkets.concat(markets);
                  finito();
               });
            });

         }, req);
      })
   }

   function computeRelated(req, res, next, data, epics, epic, callback) {

      related.compute(req, res, next, epic, function(relatedMarkets) {

         for (var i=0; i < relatedMarkets.length; i++) {
            if (epics.indexOf(relatedMarkets[i].epic) == -1) {
               epics.push(relatedMarkets[i].epic);
               data.push(relatedMarkets[i]);
            }
         }
         callback(epics, data);
      });
   }

   return {
      compute: compute,
      serve: function(server) {
         server.get('/related/:epic', function(req, res, next) {
            compute(req, res, next, req.params.epic, function(data) {
               res.send(200, data);
               return next();
            });
         });
      }
   };

};