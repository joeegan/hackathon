var restify = require('restify'),
   Q = require('noq'),
   bunyan = require('bunyan'),
   login = require('./login'),
   sentiment = require('./sentiment'),
   log = new bunyan({name: 'foo'}),
   server = restify.createServer({
      log: log
   }),
   client = restify.createJsonClient({
      url: 'https://web-api.ig.com/gateway/deal',
      headers: {
         'X-IG-API-KEY': '9326651ab2bae60b2fc6',
         'X-IG-VENDOR': '9326651ab2bae60b2fc6'
      },
      log: log
   });

server.use(restify.fullResponse());
server.use(restify.bodyParser({mapParams: false}));
server.use(restify.gzipResponse());
server.listen(8080);

login(server, client);
sentiment(server, client);
