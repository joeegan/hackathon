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
   related = require('./related')(client, log),
   volatility = require('./volatility')(client, log),
   movement = require('./movement')(client, log),
   watchlists = require('./watchlists')(client, log),
   positions = require('./positions')(client, log),
   history = require('./history')(client, log),
   workingorders = require('./workingorders')(client, log),
   currentlytrading = require('./currentlytrading')(client, log, workingorders, positions),
   suggestedmarkets = require('./suggestedmarkets')(client, log, watchlists, history),
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
server.use(restify.bodyParser({ mapParams: false }));
server.use(restify.gzipResponse());
server.listen(8080);

login.serve(server);
sentiment.serve(server);
related.serve(server);
volatility.serve(server);
movement.serve(server);
currentlytrading.serve(server);
twitter.serve(server);
watchlists.serve(server);
positions.serve(server);
history.serve(server);
workingorders.serve(server);
suggestedmarkets.serve(server);

everything(server, client, log);
