module.exports = function(server, client, log) {

   server.get('/positions', function(req, res, next) {

      client.get('/positions', function(result) {
         res.send(result.positions.map(function(instrument){
            return { epic: instrument.market.epic, name: instrument.market.instrumentName}
         }));
         return next();
      }, req);

   });

};