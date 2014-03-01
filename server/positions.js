module.exports = function(server, client, log) {

   server.get('/positions', function(req, res, next) {

      client.get('/positions', function(result) {
         var epics = [], epic, quantity;
         res.send(result.positions.map(function(instrument){
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
            }));
            return next();
      }, req);

   });

};