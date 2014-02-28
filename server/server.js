var assert = require('assert');
var API_KEY = "9326651ab2bae60b2fc6";
var restify = require('restify'),
   Q = require('noq'),
   bunyan = require('bunyan'),
   login = require('./login'),
   sentiment = require('./sentiment'),
   log = new bunyan({ name: 'log' }),
   client = restify.createClient({
      url: 'https://web-api.ig.com/gateway/deal/session/',
      headers: {
         "X-IG-API-KEY":     API_KEY,
         "Content-Type":	  "application/json; charset=UTF-8",
         "Accept":      	  "application/json; charset=UTF-8",
         "X-IG-VENDOR":	     API_KEY,
         "X-IG-API-KEY":     API_KEY,
         "X-SECURITY-TOKEN": "c5880277e3e528a64767f2576676a7f7c3376c4a6f535ac400799a90937990c8",
         "CST":	           "3710229fb6b9828e9a1e96ba92d23d1dd4fe1ddb20e4ed418604664ea3db47b1"
      }
      url: 'https://web-api.ig.com/gateway/deal/session',
      log: log
   }),
   server = restify.createServer({
      log: log
   });
server = restify.createServer();

server.use(restify.fullResponse());
server.use(restify.bodyParser({mapParams: false}));
server.use(restify.gzipResponse());
server.listen(8080);

login(server);
sentiment(server);

server.post('/login', function(req, res) {
   client.post({ identifier: req.body.identifier, password: req.body.password}, function(err, req){
//      log(err);
      assert.ifError(err);

      req.on('result', function(err, res) {
         assert.ifError(err);
         res.body = '';
         res.setEncoding('utf8');
         res.on('data', function(chunk) {
            res.body += chunk;
         });

         res.on('end', function() {
            console.log(res.body);
         });
      });

      req.write('hello world');
      req.end();
   });
});
