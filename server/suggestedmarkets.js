/**
 * Returns the unique markets that the user has previously traded on or has in a custom watchlist.
 */

module.exports = function(client, log, watchlists, history) {

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
                  data.push(historyMarkets[i]);
               }
            }
            callback(data);
         });

      });
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

