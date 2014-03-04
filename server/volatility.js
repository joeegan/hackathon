/**
* Takes the last 12 5 min candles, and calculates the std dev of the latest 3 based on the difference between their high and low prices.
* Weighting is higher when the diff is increasing away from the mean
*/
module.exports = function(client, log) {

   var tz = require('timezone');

   function compute(req, res, next, epic, callback) {

      var end = tz(Date.now(), '%Y:%m:%d-%H:%M:%S'),
         start = tz(Date.now() - 30 * 60000, '%Y:%m:%d-%H:%M:%S');

      client.get('/prices/' + epic + '/MINUTE_5?startdate=' + encodeURIComponent(start) + '&enddate=' + encodeURIComponent(end), function(result) {

         if (!result || !result.prices) {
            res.send(400);
            return next();
         }

         var prices = result.prices,
            i,
            diff,
            sum = 0,
            mean,
            squares = [],
            stddev;

         for (i = 0; i < prices.length; i++) {
            diff = ((prices[i].highPrice.bid + prices[i].highPrice.ask) / 2) - ((prices[i].lowPrice.bid + prices[i].lowPrice.ask) / 2);
            sum += diff;
         }
         mean = sum / prices.length;

         for (i = prices.length - 1; i > prices.length - 4 && i > 0; i--) {
            diff = ((prices[i].highPrice.bid + prices[i].highPrice.ask) / 2) - ((prices[i].lowPrice.bid + prices[i].lowPrice.ask) / 2);
            if (diff > mean) {
               squares.push(Math.pow(diff - mean, 2));
            } else {
               squares.push(mean);
            }
         }

         sum = 0;
         for (i = 0; i < squares.length; i++) {
            sum += squares[i];
         }
         stddev = Math.sqrt(sum / squares.length);

         result.index = Math.min(stddev / 2, 10) || 0;
         callback(result);
      }, req);
   }

   return {
      compute: compute,
      serve: function(server) {
         server.get('/volatility/:epic', function(req, res, next) {
            compute(req, res, next, req.params.epic, function(data) {
               res.send(200, data);
               return next();
            });
         });
      }
   };

};
