module.exports = function(server) {

    var restify = require('restify'),
        client = restify.createClient({
            url: 'https://web-api.ig.com/gateway/deal/session'
        });

    /** LOGIN ENDPOINT HERE **/
};