var restify = require('restify'),
   Q = require('q'),
   login = require('./login'),
   sentiment = require('./sentiment'),
   client = restify.createClient({
      url: 'https://web-api.ig.com/gateway/deal/session'
   }),
   server = restify.createServer();

server.use(restify.fullResponse());
server.use(restify.bodyParser({mapParams: false}));
server.use(restify.gzipResponse());
server.listen(8080);

login(server);
sentiment(server);

server.post('/login', function(req, res) {
   console.log(req);
   req.send(req);
   client.post({ identifier: req.body.params.identifier, password: req.params.password}, function(err, response){
      console.log(response);
      res.send('hello ' + req.params.username, response);
   });
});
