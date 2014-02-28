module.exports = function(server, client, log) {

   server.get('/history', function(req, res, next) {

      client.get('/history/activity/1000000000', function(result) {
         var epics = [];
         res.send(result.activities.sort(function(a, b) {
               return a.activityHistoryId < b.activityHistoryId;
         }).map(function(order){
               console.log(order);
            if (epics.indexOf(order.epic) == -1) {
               epics.push(order.epic);
               order = { epic: order.epic, name: order.marketName };
               return order;
            }
         }).filter(function(order){ return !!order; }));
         return next();
      }, req);

   });

};