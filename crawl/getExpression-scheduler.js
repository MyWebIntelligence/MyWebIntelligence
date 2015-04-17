"use strict";

var os = require('os');
var child_process = require('child_process');
var spawn = child_process.spawn;
var exec = child_process.exec;

var Channel = require('../common/lengthed-message-protocol/Channel');

var database = require('../database');

var promiseResolveRejectByURL = new Map();
var pendingURLByWorker = new WeakMap();
var channelByWorker = new WeakMap();

var MAXIMUM_NICENESS = 19;


var PIPE_FD = 3;

var getExpressionWorkers = os.cpus().slice(0, 1).map(function(){
    var stdio = [0, 1, 2];
    stdio[PIPE_FD] = 'pipe';
    
    var worker = spawn('node', [require.resolve('./getExpression-child-process.js')], {
        // 4th pipe is for communication
        stdio: stdio
    });
    
    // Setting super-low priority so this CPU-intensive task doesn't get in the way of the server or
    // other more important tasks
    exec( ['renice', '-n', MAXIMUM_NICENESS, worker.pid].join(' ') );
    
    pendingURLByWorker.set(worker, new Set());
    
    var channel = new Channel(worker.stdio[PIPE_FD], worker.stdio[PIPE_FD]);
    channelByWorker.set(worker, channel);
    
    channel.on('message', function(buff){
        // console.log('receiving  child', req.body);
        var response = JSON.parse(buff.toString());
        
        var url = response.url;

        if(response.error){
            console.error('resp ERR', url, response.error);
        }
        else{
            var expression = response.expression;

            console.log('resp', url);

            var resolve = promiseResolveRejectByURL.get(url).resolve;
            resolve(expression);
        }

        promiseResolveRejectByURL.delete(url);
        // deleting from all workers is inefficient, but lazy to keep track across HTTP reqs. Use cap URL for that purpose
        getExpressionWorkers.forEach(function(w){
            pendingURLByWorker.get(w).delete(url);
        });

        console.log(getExpressionWorkers.map(function(w){ return pendingURLByWorker.get(w).size }));
    });
    
    return worker;
});



/*
    Fetch the URL (to get redirects and the body)
    Extract core content (from readability or otherwise).
*/
module.exports = function getExpression(url){
    // console.log('scheduler', url);
    
    if(promiseResolveRejectByURL.has(url))
        return promiseResolveRejectByURL.get(url).promise;
    
    /*
        This test (whether there is an existing expression) belongs to getExpression.
        However, in the filedb, reads (in workers) and writes (in "main thread") collide resulting in
        "SyntaxError: Unexpected end of input" errors
    */
    return database.Expressions.findByURIAndAliases(new Set([url])).then(function(expressions){
        
        if(expressions[0]){ // url already has an entry in the database
            // to not resave a document extracted as is from the DB.
            // Sorry for double negative. Alternative would be setting true to most of objects (and maybe forget to)
            expressions[0]._dontSave = true; 
            return expressions[0];
        }
        else{
            var resolve, reject;

            var p = new Promise(function(_resolve, _reject){
                resolve = _resolve;
                reject = _reject;

                // pick worker with less pending work
                var mostAvailableWorker = getExpressionWorkers.reduce(function(acc, curr){
                    return pendingURLByWorker.get(acc).size < pendingURLByWorker.get(curr).size ?
                        acc :
                        curr;
                });

                var channel = channelByWorker.get(mostAvailableWorker);
                
                channel.send(JSON.stringify({url: url}));

                var pendingURLs = pendingURLByWorker.get(mostAvailableWorker);
                pendingURLs.add(url);
            });

            promiseResolveRejectByURL.set(url, {
                promise: p,
                resolve: resolve,
                reject: reject
            });

            return p;
        }
    });
};
