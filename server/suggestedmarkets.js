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
            var randomEpics = [];
            for (var i=0; i < historyMarkets.length; i++) {
               if (epics.indexOf(historyMarkets[i].epic) == -1) {
                  epics.push(historyMarkets[i].epic);
                  data.push(historyMarkets[i]);
               }
            }
            // in addition, two related markets
            randoms.push(data[Math.floor(Math.random()*data.length)]);
            randoms.push(data[Math.floor(Math.random()*data.length)]);
            computeRelated(req, res, next, data, randomEpics, callback);
         });

      });
   }

   function computeRelated(req, res, next, data, epics, callback) {

      var searchEpics = epics.slice(),
         i,
         cbTotal = 1,
         cbCurrent = 0;

      searchEpics = [searchEpics[0]];

      for (i = 0; i < searchEpics.length; i++) {

         cbTotal++;
         related.compute(req, res, next, searchEpics[i], function(relatedMarkets) {

            for (var i=0; i < relatedMarkets.length; i++) {
               if (epics.indexOf(relatedMarkets[i].epic) == -1) {
                  epics.push(relatedMarkets[i].epic);
                  data.push(relatedMarkets[i]);
               }
            }
            cbCurrent++;
            if (cbCurrent == cbTotal) {
               callback(shuffle(data).slice(0,7));
            }
         });
      }

      (function finalise() {
         cbCurrent++;
         if (cbCurrent == cbTotal) {
            callback(shuffle(data).slice(0,7));
         }
      })();
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

