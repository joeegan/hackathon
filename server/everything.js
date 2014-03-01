module.exports = function(server, client, log) {

   var sentiment = require('./sentiment')(client, log),
      volatility = require('./volatility')(client, log),
      movement = require('./movement')(client, log),
      twitter = require('./twitter')(client, log);

   server.get(/^\/everything\/([a-z,]+)\/(.*)/, function (req, res, next) {

      var indexes = req.params[0].split(','),
          epics = req.params[1].split(','),
          results = {},
          cbTotal = 1,
          cbCurrent = 0;

      function finito() {

         var epic,
            keys,
            indexes;

         for (epic in results) {
            keys = Object.keys(results[epic]);
            indexes = keys.map(function(key){
               return results[epic][key].index;
            });
            results[epic].index = indexes.reduce(function(total, curr) { return total + curr; } , 0) / indexes.length;
         }

         res.send(200, results);
         return next();
      }


      function compute(fn, name) {

         var i;

         for (i = 0; i < epics.length; i++) {
            cbTotal++;
            fn.compute(req, res, next, epics[i], function(epic, data) {
               if (!results.hasOwnProperty(epic)) {
                  results[epic] = {};
               }
               results[epic][name] = data;
               cbCurrent++;
               if (cbCurrent == cbTotal) {
                  finito();
               }
            }.bind(null, epics[i]));
         }
      }

      if (indexes.indexOf('sentiment') >= 0) {
         compute(sentiment, 'sentiment');
      }
      if (indexes.indexOf('movement') >= 0) {
         compute(movement, 'movement');
      }
      if (indexes.indexOf('volatility') >= 0) {
         compute(volatility, 'volatility');
      }
      if (indexes.indexOf('twitter') >= 0) {
         compute(twitter, 'twitter');
      }

      (function finalise() {
         cbCurrent++;
         if (cbCurrent == cbTotal) {
            finito();
         }
      })();

   });

};