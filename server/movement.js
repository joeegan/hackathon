/**
* Takes the last 12 5 min candles, and calculates the std dev of the latest 3 based on the difference between their mid prices.
* Weighting is higher when the price is moving away from the mean
*/
module.exports = function(client, log) {

   var tz = require('timezone');
   
   function compute(req, res, next, epic, callback) {

      var oneDay = 1000 * 60 * 60 * 24,
         end = tz(Date.now() - oneDay, '%Y:%m:%d-%H:%M:%S'),
         start = tz(Date.now() - 60 * 60000 - oneDay, '%Y:%m:%d-%H:%M:%S');

      client.get('/prices/' + epic + '/MINUTE_5?startdate=' + encodeURIComponent(start) + '&enddate=' + encodeURIComponent(end), function(result) {

         if (!result || !result.prices) {
            res.send(400);
            return next();
         }

         var prices = result.prices,
            i,
            mid,
            sum = 0,
            mean,
            squares = [],
            stddev;

         for (i = 0; i < prices.length; i++) {
            mid = (prices[i].closePrice.bid + prices[i].closePrice.ask) / 2;
            sum += mid;
         }
         mean = sum / prices.length;

         for (i = prices.length - 1; i > prices.length - 4 && i > 0; i--) {
            mid = (prices[i].closePrice.bid + prices[i].closePrice.ask) / 2;
            squares.push(Math.pow(mid - mean, 2));
         }

         sum = 0;
         for (i = 0; i < squares.length; i++) {
            sum += squares[i];
         }
         stddev = Math.sqrt(sum / squares.length);

         callback(Math.min(stddev / 2, 10) || 0);
      }, req);
   }

   return {
      compute: compute,
      serve: function(server) {
         server.get('/movement/:epic', function(req, res, next) {
            compute(req, res, next, req.params.epic, function(index) {
               res.send(200, index);
               return next();
            });
         });
      }
   };

};
