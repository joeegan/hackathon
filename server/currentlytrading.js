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
            orders[i].type = ' working order';
            epics.push(orders[i].epic);
         }
         currentpositions.compute(req, res, next, function(positions){
            for (var i=0; i<positions.length; i++) {
               positions[i].type = ' open position';
               if (epics.indexOf(positions[i].epic) > -1) {
                  var item = data.filter(function(order) {
                     return order.epic == positions[i].epic;
                  })[0];
                  if (item) {
                     item.quantity++;
                     item.type = ' open position';
                  }
               } else {
                  data.push(positions[i]);
               }
            }
            for (i=0; i<data.length; i++) {
               data[i].type = data[i].quantity + data[i].type;
               if (data[i].quantity > 1) {
                  data[i].type = data[i].type + 's';
               }
            }
            callback(data);
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

