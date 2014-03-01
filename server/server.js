var restify = require('restify'),
   Q = require('noq'),
   bunyan = require('bunyan'),
   log = new bunyan({name: 'log'}),
   server = restify.createServer({
      log: log
   }),
   client = require('./client')(log),
   login = require('./login')(client, log),
   sentiment = require('./sentiment')(client, log),
   volatility = require('./volatility')(client, log),
   movement = require('./movement')(client, log),
   markets = require('./markets')(client, log),
   positions = require('./positions'),
   workingorders = require('./workingorders'),
   currentlytrading = require('./currentlytrading')(client, log),
   history = require('./history'),
   everything = require('./everything'),
   twitter = require('./twitter');

restify.CORS.ALLOW_HEADERS.push('x-security-token');
restify.CORS.ALLOW_HEADERS.push('cst');

server.use(restify.CORS({
   origins: [
      'http://localhost:8000',
      'http://localhost:8080'
   ]
}));
server.use(restify.bodyParser({ mapParams: false }));
server.use(restify.gzipResponse());
server.listen(8080);

login.serve(server);
sentiment.serve(server);
volatility.serve(server);
movement.serve(server);
currentlytrading.serve(server);


markets.serve(server);
positions(server, client, log);
history(server, client, log);
twitter(server, client, log);
workingorders(server, client, log);


everything(server, client, log);
