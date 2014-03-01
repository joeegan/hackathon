module.exports = function(client, log) {

   function compute(req, res, next) {

      client.get('/workingorders', function(result) {
         var epics = [], epic, quantity;
         res.send(result.workingOrders.map(function(order){
            epic = order.workingOrderData.epic;
            epics.push(epic);
            quantity = epics.filter(function(x){return x==epic}).length;
            return {
               epic: epic,
               name: order.marketData.instrumentName,
               quantity: quantity
            }
         }).sort(function(a,b) {
               return a.quantity < b.quantity;
            }).filter(function(item,idx,arr) {
               return arr.map(function(item){ return item.epic}).indexOf(item.epic) >= idx;
            }));
      }, req);
   }

   return {
      compute: compute,
      serve: function(server) {
         server.get('/workingorders', function(req, res, next) {
            compute(req, res, next, function(index) {
               res.send(200, index);
               return next();
            });
         });
      }
   };

};

