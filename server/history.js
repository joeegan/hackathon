/*
   Returns an array of markets that the user has interacted with in the last 1000000000 milliseconds
 */

module.exports = function(client, log) {

   function compute(req, res, next, callback) {

      client.get('/history/activity/1000000000', function(result) {
         var epics = [];
         callback(result.activities.sort(function(a, b) {
               return a.activityHistoryId < b.activityHistoryId;
         }).map(function(order){
            if (epics.indexOf(order.epic) == -1) {
               epics.push(order.epic);
               order = { epic: order.epic, name: order.marketName };
               return order;
            }
         }).filter(function(order){ return !!order; }));
      }, req);
   }

   return {
      compute: compute,
      serve: function(server) {
         server.get('/history', function(req, res, next) {
            compute(req, res, next, function(index) {
               res.send(200, index);
               return next();
            });
         });
      }
   };

};
