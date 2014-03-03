/**
 * Returns the unique markets that the user has previously traded on or has in a custom watchlist.
 */

module.exports = function(client, log, watchlists, history, related) {

   function compute(req, res, next, callback) {

      var data = [],
         epics = [];
      watchlists.compute(req, res, next, function(watchlistMarkets) {
         data = data.concat(watchlistMarkets);
         for (var i = 0; i < watchlistMarkets.length; i++) {
            epics.push(watchlistMarkets[i].epic);
         }

         history.compute(req, res, next, function(historyMarkets) {
            for (var i=0; i < historyMarkets.length; i++) {
               if (epics.indexOf(historyMarkets[i].epic) == -1) {
                  epics.push(historyMarkets[i].epic);
                  data.push(historyMarkets[i]);
               }
            }

            computeRelated(req, res, next, data, data[Math.floor(Math.random()*data.length)], epics, function(epics, data) {

               computeRelated(req, res, next, data, data[Math.floor(Math.random()*data.length)], epics, function(epics, data) {
                  
                  callback(shuffle(data).slice(0,7));
               });
            });
         });

      });
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

