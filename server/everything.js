module.exports = function(server, client, log) {

   var sentiment = require('./sentiment'),
      volatility = require('./volatility'),
      movement = require('./movement');

   server.get(/^\/everything\/([a-z,]+)\/markets\/(.*)/, function (req, res, next) {

      var indexes = req.params[0].split(','),
          epics = req.params[0].split(',');

      if (indexes.indexOf('sentiment') >= 0) {

      }
      if (indexes.indexOf('movement') >= 0) {
         
      }
      if (indexes.indexOf('volatility') >= 0) {
         
      }

      res.send(200, 'ok');
      return next();
   });

};