var restify = require('restify'),
    server = restify.createServer();

server.use(restify.fullResponse());
server.use(restify.bodyParser());
server.use(restify.gzipResponse());
server.listen(8080);

/**
 * LOGIN
 *
 * Given a username and password, do the login and return sso token
 */
server.post({
    path: /^\/login/
}, function(request, response, next) {

    response.send('ssotokenhere');
    return next();
});
