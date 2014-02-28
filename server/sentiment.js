module.exports = function(server) {

    server.get('/sentiment', function(req, res) {
        res.send('test');
    });
};