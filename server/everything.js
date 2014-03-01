module.exports = function(server, client, log) {

   var sentiment = require('./sentiment')(client, log),
      volatility = require('./volatility')(client, log),
      movement = require('./movement')(client, log),
      twitter = require('./twitter')(client, log);

   server.get(/^\/everything\/([a-z,]+)\/(.*)/, function (req, res, next) {

      var indexes = req.params[0].split(','),
          epics = req.params[1].split(','),
          epic,
          results = {},
          cbTotal = 1,
          cbCurrent = 0,
          i;

      function finito() {

         means = {};
         for (epic in results) {
            means[epic] = results[epic].reduce(function(total, curr) { return total + curr; } , 0) / results[epic].length;
         }

         res.send(200, means);
         return next();
      }

      function compute(fn) {
         var i;
         for (i = 0; i < epics.length; i++) {
            epic = epics[i];
            cbTotal++;
            fn.compute(req, res, next, epic, function(data) {
               if (!results.hasOwnProperty(epic)) {
                  results[epic] = [];
               }
               results[epic].push(data.index);
               cbCurrent++;
               if (cbCurrent == cbTotal) {
                  finito();
               }
            });
         }
      }

      if (indexes.indexOf('sentiment') >= 0) {
         compute(sentiment);
      }
      if (indexes.indexOf('movement') >= 0) {
         compute(movement);
      }
      if (indexes.indexOf('volatility') >= 0) {
         compute(volatility);
      }
      if (indexes.indexOf('twitter') >= 0) {
         compute(twitter);
      }

      (function finalise() {
         cbCurrent++;
         if (cbCurrent == cbTotal) {
            finito();
         }
      })();

   });

};