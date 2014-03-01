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
            computeRelated(req, res, next, data, epics, callback);
         });

      });
   }

   function computeRelated(req, res, next, data, epics, callback) {

      var searchEpics = epics.slice(),
         epic,
         i,
         cbTotal = 1,
         cbCurrent = 0;

      for (i = 0; i < searchEpics.length; i++) {

         epic = searchEpics[i];
         cbTotal++;
         related.compute(req, res, next, epic, function(relatedMarkets) {

            for (var i=0; i < relatedMarkets.length; i++) {
               if (epics.indexOf(relatedMarkets[i].epic) == -1) {
                  epics.push(relatedMarkets[i].epic);
                  data.push(relatedMarkets[i]);
               }
            }
            cbCurrent++;
            if (cbCurrent == cbTotal) {
               callback(data);
            }
         });
      }

      (function finalise() {
         cbCurrent++;
         if (cbCurrent == cbTotal) {
            callback(data);
         }
      })();
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

