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
   positions = require('./positions')(client, log),
   workingorders = require('./workingorders')(client, log),
   currentlytrading = require('./currentlytrading')(client, log),
   history = require('./history'),
   everything = require('./everything'),
   twitter = require('./twitter')(client, log);

restify.CORS.ALLOW_HEADERS.push('x-security-token');
restify.CORS.ALLOW_HEADERS.push('cst');

server.use(restify.CORS({
   origins: [
      'http://localhost:8000',
      'http://localhost:8080'
   ]
}));
server.use(restify.bodyParser());
server.use(restify.gzipResponse());
server.listen(8080);

login.serve(server);
sentiment.serve(server);
volatility.serve(server);
movement.serve(server);
currentlytrading.serve(server);
twitter.serve(server);

markets.serve(server);
positions.serve(server);
history(server, client, log);
workingorders.serve(server);

everything(server, client, log);
