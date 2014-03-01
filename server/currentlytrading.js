/**
 * Returns unique markets that the user has open positions or working orders with, in order of quantity.
 */

module.exports = function(client, log, workingorders, currentpositions) {

   function compute(req, res, next, callback) {
      var data = [];
      workingorders.compute(req, res, next, function(orders){
         var epics = [];
         data = data.concat(orders);
         for (var i = 0; i < orders.length; i++) {
            epics.push(orders[i].epic);
         }
         currentpositions.compute(req, res, next, function(positions){
            for (var i=0; i<positions.length; i++) {
               if (epics.indexOf(positions[i].epic) > -1) {
                  var item = data.filter(function(order) {
                     return order.epic == positions[i].epic;
                  })[0];
                  if (item) {
                     item.quantity++;
                  }
               } else {
                  data.push(positions[i]);
               }
            }
            callback(data.sort(function(a,b) {
               return a.quantity < b.quantity;
            }).slice(0,5));
         });
      });
   }

   return {
      compute: compute,
      serve: function(server) {
         server.get('/currentlytrading', function(req, res, next) {
            compute(req, res, next, function(instruments) {
               res.send(200, instruments);
               return next();
            });
         });
      }
   };

};

