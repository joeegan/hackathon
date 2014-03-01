var restify = require('restify'),
   Q = require('noq'),
   bunyan = require('bunyan'),
   login = require('./login'),
   sentiment = require('./sentiment'),
   positions = require('./positions'),
   volatility = require('./volatility'),
   movement = require('./movement'),
   history = require('./history'),
   everything = require('./everything'),
   twitter = require('./twitter'),
   markets = require('./markets'),
   log = new bunyan({name: 'log'}),
   server = restify.createServer({
      log: log
   }),
   client = require('./client')(log);

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
sentiment.serve(server, client, log);
positions(server, client, log);
volatility(server, client, log);
movement(server, client, log);
history(server, client, log);
twitter(server, client, log);
markets(server, client, log);

everything(server, client, log);
