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
               watchlistMarkets[i].type = 'watchlist';
               epics.push(watchlistMarkets[i].epic);
               data.push(watchlistMarkets[i]);
            }
         }

         history.compute(req, res, next, function(historyMarkets) {
            historyMarkets = historyMarkets.slice(0,8);
            for (var i=0; i < historyMarkets.length; i++) {
               if (epics.indexOf(historyMarkets[i].epic) == -1) {
                  historyMarkets[i].type = 'historic';
                  epics.push(historyMarkets[i].epic);
                  data.push(historyMarkets[i]);
               }
            }

            data = shuffle(data);

            computeRelated(req, res, next, data, epics, data[Math.floor(Math.random()*data.length)].epic, function() {

               computeRelated(req, res, next, data, epics, data[Math.floor(Math.random()*data.length)].epic, function() {
                  
                  callback(shuffle(data));
               });
            });
         });

      });
   }

   function computeRelated(req, res, next, data, epics, epic, callback) {

      related.compute(req, res, next, epic, function(relatedMarkets) {

         for (var i=0; i < relatedMarkets.length; i++) {
            if (epics.indexOf(relatedMarkets[i].epic) == -1) {
               relatedMarkets[i].type = 'related';
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

