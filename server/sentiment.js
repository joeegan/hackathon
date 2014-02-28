module.exports = function(server, client) {

   server.get('/sentiment', function(req, res, next) {
      
      res.send('hello world');
      return next();
   });
};