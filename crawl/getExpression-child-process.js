"use strict";

require('../ES-mess');

var app = require('express')();
var compression = require('compression');
var bodyParser = require('body-parser');

var request = require('request');

var getExpression = require('./getExpression');

process.title = "MyWI getExpression worker";

console.log('process on!', process.pid);

var server;

app.use(compression());
app.use(bodyParser.json());

// initial message is sync IPC for port and answer URL. All other communication will be via HTTP
process.once('message', function(m){
    var port = m.port;
    answerURL = m.answerURL;
    
    console.log('child', process.pid, port);
    server = app.listen(port, '127.0.0.1');
});

var answerURL;

app.post('*', function(req, res){
    //console.log('POST', process.pid, req.body);
    
    var url = req.body.url;
    
    getExpression(url)
        .then(function(expression){
            request.post({
                url: answerURL,
                method: 'POST',
                json: true,
                body: {
                    url: url,
                    expression: expression
                }
            });
        })
        .catch(function(err){
            request.post({
                url: answerURL,
                method: 'POST',
                json: true,
                body: {
                    url: url,
                    error: String(err)
                }
            });
            
            console.log('child error', err, err.stack);
        });
    
    // acknowledging that the URL has been received
    res.send('');
});


process.on('SIGINT', function(){
    server.close();
    process.exit();
});
