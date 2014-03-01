var restify = require('restify'),
   Q = require('noq'),
   bunyan = require('bunyan'),
   log = new bunyan({name: 'log'}),
   server = restify.createServer({
      log: log
   }),
   client = require('./client')(log),
   login = require('./login'),
   sentiment = require('./sentiment')(client, log),
   volatility = require('./volatility')(client, log),
   movement = require('./movement')(client, log),
   positions = require('./positions'),
   workingorders = require('./workingorders'),
   currentlytrading = require('./currentlytrading')(client, log),
   history = require('./history'),
   everything = require('./everything'),
   twitter = require('./twitter'),
   markets = require('./markets');

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

login(server, client, log);
sentiment.serve(server);
volatility.serve(server);
movement.serve(server);
currentlytrading.serve(server);


positions(server, client, log);
history(server, client, log);
twitter(server, client, log);
markets(server, client, log);
workingorders(server, client, log);


everything(server, client, log);
