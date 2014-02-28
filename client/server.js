var connect = require('connect');

connect()
    .use(connect.static(__dirname + '/www'))
    .listen(8000);