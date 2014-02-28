module.exports = function(server, client, log) {

   var tz = require('timezone');

   server.get('/volatility/:epic', function(req, res, next) {

      var end = tz(Date.now(), '%Y:%m:%d-%H:%M:%S'),
         start = tz(Date.now() - 60 * 60000, '%Y:%m:%d-%H:%M:%S');

      client.get('/prices/' + req.params.epic + '/MINUTE_5?startdate=' + encodeURIComponent(start) + '&enddate=' + encodeURIComponent(end), function(result) {

         if (!result.prices) {
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

         for (i = prices.length - 1; i > prices.length - 4; i--) {
            mid = (prices[i].closePrice.bid + prices[i].closePrice.ask) / 2;
            squares.push(Math.pow(mid - mean, 2));
         }

         sum = 0;
         for (i = 0; i < squares.length; i++) {
            sum += squares[i];
         }
         stddev = Math.sqrt(sum / squares.length);

         result.index = Math.min(stddev / 2, 10);

         res.send(200, result);
         return next();
      }, req);
   });

};