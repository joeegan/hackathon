var restify = require('restify'),
   Q = require('noq'),
   bunyan = require('bunyan'),
   login = require('./login'),
   sentiment = require('./sentiment'),
   log = new bunyan({ name: 'log' }),
   server = restify.createServer({
      log: log
   }),
   client = require('./client')(log);

server.use(restify.fullResponse());
server.use(restify.bodyParser({ mapParams: false }));
server.use(restify.gzipResponse());
server.listen(8080);

login(server, client, log);
sentiment(server, client, log);
