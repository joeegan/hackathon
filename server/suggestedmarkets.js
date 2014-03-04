/**
 * Returns the unique markets that the user has previously traded on or has in a custom watchlist.
 */

module.exports = function(client, log, watchlists, history, related) {

   function compute(req, res, next, callback) {

      var data = [],
         epics = [];

      watchlists.compute(req, res, next, function(watchlistMarkets) {
         watchlistMarkets = watchlistMarkets.slice(0,8);
         for (var i=0; i < watchlistMarkets.length; i++) {
            if (epics.indexOf(watchlistMarkets[i].epic) == -1) {
               watchlistMarkets[i].type = 'In a watchlist';
               epics.push(watchlistMarkets[i].epic);
               data.push(watchlistMarkets[i]);
            }
         }

         history.compute(req, res, next, function(historyMarkets) {
            historyMarkets = historyMarkets.slice(0,8);
            for (var i=0; i < historyMarkets.length; i++) {
               if (epics.indexOf(historyMarkets[i].epic) == -1) {
                  historyMarkets[i].type = 'Traded on before';
                  epics.push(historyMarkets[i].epic);
                  data.push(historyMarkets[i]);
               }
            }

            data = shuffle(data);

            computeRelated(req, res, next, data, epics, watchlistMarkets[Math.floor(Math.random()*watchlistMarkets.length)], 'a watchlist', function() {

               computeRelated(req, res, next, data, epics, historyMarkets[Math.floor(Math.random()*historyMarkets.length)], 'your history', function() {
                  
                  callback(shuffle(data));
               });
            });
         });

      });
   }

   function computeRelated(req, res, next, data, epics, market, from, callback) {

      if (!market) {
         callback();
         return;
      }

      related.compute(req, res, next, market.epic, function(relatedMarkets) {

         for (var i=0; i < relatedMarkets.length; i++) {
            if (epics.indexOf(relatedMarkets[i].epic) == -1) {
               relatedMarkets[i].type = 'Related to ' + market.name + ' which is in ' + from;
               epics.push(relatedMarkets[i].epic);
               data.push(relatedMarkets[i]);
            }
         }
         callback();
      });
   }

   function shuffle(o){
      for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
   }

   return {
      compute: compute,
      serve: function(server) {
         server.get('/suggestedmarkets', function(req, res, next) {
            compute(req, res, next, function(instruments) {
               res.send(200, instruments);
               return next();
            });
         });
      }
   };

};

