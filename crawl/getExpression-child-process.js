"use strict";

require('../ES-mess');
process.title = "MyWI getExpression worker";

var fs = require('fs');

var Channel = require('../common/lengthed-message-protocol/Channel');
var getExpression = require('./getExpression');

console.log('# getExpression process', process.pid);

var ONE_HOUR = 60*60*1000; // ms

var PIPE_FD = 3;
var THROTTLING_WINDOW = 30;

var inFlightURLs = new Set/*<url>*/();
var pendingURLs = new Set/*<url>*/();

var channel = new Channel(fs.createReadStream(undefined, {fd: PIPE_FD}), fs.createWriteStream(undefined, {fd: PIPE_FD}));


function processURL(url){
    inFlightURLs.add(url);
    
    return getExpression(url)
        .then(function(expression){
            channel.send(JSON.stringify({
                url: url,
                expression: expression
            }));
        })
        .catch(function(err){
            console.log('child error', url, err, err.stack);
        
            channel.send(JSON.stringify({
                url: url,
                error: String(err)
            }));
        
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

channel.on('message', function(buff){
    //console.log('POST', process.pid, req.body);
    var msg = JSON.parse(buff.toString());
    
    var url = msg.url;
    
    if(inFlightURLs.size < THROTTLING_WINDOW)
        processURL(url);
    else
        pendingURLs.add(url);
});

process.on('uncaughtException', function(e){
    console.error('# uncaughtException getExpression', process.pid, Date.now() % ONE_HOUR, e, e.stack);
    process.exit();
});

process.on('SIGINT', function(){
    console.log('SIGINT', process.pid);
    process.exit();
});
