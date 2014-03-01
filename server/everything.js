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
          cbCurrent = 0,
          calls = [];

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

      function doCompute(epics, i, fn, name, compute) {
         return function() {
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
         };
      }

      function compute(fn, name) {

         var i;

         for (i = 0; i < epics.length; i++) {
            cbTotal++;
            setTimeout(doCompute(epics, i, fn, name, compute), cbTotal * 200);
         }
      }

      function callit() {
         calls.shift()();
         if (calls.length) {
            setTimeout(callit, 200);
         }
      }

      if (indexes.indexOf('sentiment') >= 0) {
         calls.push(function() { compute(sentiment, 'sentiment'); });
      }
      if (indexes.indexOf('movement') >= 0) {
         calls.push(function() { compute(movement, 'movement'); });
      }
      if (indexes.indexOf('volatility') >= 0) {
         calls.push(function() { compute(volatility, 'volatility'); });
      }
      if (indexes.indexOf('twitter') >= 0) {
         calls.push(function() { compute(twitter, 'twitter'); });
      }

      callit();

      (function finalise() {
         cbCurrent++;
         if (cbCurrent == cbTotal) {
            finito();
         }
      })();

   });

};