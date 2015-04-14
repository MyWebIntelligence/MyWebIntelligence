"use strict";

require('../ES-mess');
process.title = "MyWI getExpression worker";

var app = require('express')();
var compression = require('compression');
var bodyParser = require('body-parser');

var request = require('request');

var getExpression = require('./getExpression');

console.log('process on!', process.pid);


var answerURL;
var server;

// initial message is sync IPC for port and answer URL. All other communication will be via HTTP
process.once('message', function(m){
    var port = m.port;
    answerURL = m.answerURL;
    
    console.log('child', process.pid, port);
    server = app.listen(port, '127.0.0.1');
});



var THROTTLING_WINDOW = 60;
var inFlightURLs = new Set/*<url>*/();
var pendingURLs = new Set/*<url>*/();

function processURL(url){
    
    inFlightURLs.add(url);
    
    return getExpression(url)
        .then(function(expression){
            request.post({
                url: answerURL,
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
                json: true,
                body: {
                    url: url,
                    error: String(err)
                }
            });

            console.log('child error', url, err/*, err.stack*/);
        
            return; // symbolic. Just to make explicit the next .then is a "finally"
        })
        // in any case "finally"
        .then(function(){
            inFlightURLs.delete(url);
            if(pendingURLs.size >= 1){
                var urlToDo = pendingURLs._pick();
                processURL(urlToDo);
            }
            console.log('getExpression', process.pid, '#', inFlightURLs.size, pendingURLs.size);
        });
        
}



app.use(compression());
app.use(bodyParser.json());

app.post('*', function(req, res){
    //console.log('POST', process.pid, req.body);
    
    var url = req.body.url;
    
    if(inFlightURLs.size < THROTTLING_WINDOW)
        processURL(url);
    else
        pendingURLs.add(url);
    
    // acknowledging that the URL has been received
    res.send('');
});

process.on('uncaughtException', function(e){
    console.error('uncaughtException getExpression', process.pid, e, e.stack);
    process.exit();
});

process.on('SIGINT', function(){
    server.close();
    process.exit();
});
