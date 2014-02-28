module.exports = function(server, client, log) {

   server.get('/everything', function (req, res, next) {
      console.log(req);
      res.send('foo');
      return next();
   });

};