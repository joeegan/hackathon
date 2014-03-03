module.exports = function(client, log) {

   function compute(req, res, next, callback) {

      client.get('/positions', function(result) {
         var epics = [], epic, quantity;
         callback(result.positions.map(function(instrument){
            epic = instrument.market.epic;
            epics.push(epic);
            quantity = epics.filter(function(x){return x==epic}).length;
            return {
               epic: epic,
               name: instrument.market.instrumentName,
               quantity: quantity
            }
         }).sort(function(a,b) {
            return a.quantity < b.quantity;
         }).filter(function(item,idx,arr) {
            return arr.map(function(item){ return item.epic}).indexOf(item.epic) >= idx;
         }).slice(0,10));
      }, req);
   }

   return {
      compute: compute,
      serve: function(server) {
         server.get('/positions', function(req, res, next) {
            compute(req, res, next, function(positions) {
               res.send(200, positions);
               return next();
            });
         });
      }
   };

};