var restify = require('restify'),
   Q = require('noq'),
   bunyan = require('bunyan'),
   login = require('./login'),
   sentiment = require('./sentiment'),
   positions = require('./positions'),
   volatility = require('./volatility'),
   movement = require('./movement'),
   everything = require('./everything'),
   log = new bunyan({name: 'log'}),
   server = restify.createServer({
      log: log
   }),
   client = require('./client')(log);

server.use(restify.CORS({
   origins: [
      'http://localhost'
   ]
}));
// full response doesn't work with cors
//server.use(restify.fullResponse());
server.use(restify.bodyParser({ mapParams: false }));
server.use(restify.gzipResponse());
server.listen(8080);

login(server, client, log);
sentiment(server, client, log);
positions(server, client, log);
volatility(server, client, log);
movement(server, client, log);
everything(server, client, log);
