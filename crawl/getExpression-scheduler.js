"use strict";

var os = require('os');
var child_process = require('child_process');
var fork = child_process.fork;
var exec = child_process.exec;

var app = require('express')();
var compression = require('compression');
var bodyParser = require('body-parser');

var request = require('request');

var database = require('../database');

var promiseResolveRejectByURL = new Map();
var pendingURLByWorker = new WeakMap();
var postURLByWorker = new WeakMap();

var ONE_HOUR = 60*60*1000; // ms

/*
    HTTP used for the purpose of async message based IPC with children
*/
var PORT = 10000;
// Strictly listen on localhost so the endpoint is not accessible from the outside world
var HOST = '127.0.0.1';

app.use(compression());
app.use(bodyParser.json({limit: Infinity}));

app.post('*', function(req, res){
    //console.log('receiving POST from child', req.body);
    
    var response = req.body;
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
    getExpressionWorkers.forEach(function(worker){
        pendingURLByWorker.get(worker).delete(url);
    });

    console.log(getExpressionWorkers.map(function(w){ return pendingURLByWorker.get(w).size }));
    
    // acknowledging that the result has been received
    res.send('');
});



app.listen(PORT, HOST, function(){
    console.log('listening');
});


var answerURL = 'http://'+HOST+':'+PORT+'/';

var MAXIMUM_NICENESS = 19;

var getExpressionWorkers = os.cpus().map(function(cpu, i){
    var worker = fork( require.resolve('./getExpression-child-process.js'), {silent: false} );
    
    var port = PORT + i +  1;
    
    worker.send({
        port: port,
        answerURL: answerURL
    });
    
    // Setting super-low priority so this CPU-intensive task doesn't get in the way of the server or
    // other more important tasks
    exec( ['renice', '-n', MAXIMUM_NICENESS, worker.pid].join(' ') );
    
    postURLByWorker.set(worker, 'http://'+HOST+':'+port+'/');
    pendingURLByWorker.set(worker, new Set());
    
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

                //console.log('most available', mostAvailableWorker.pid, url);
                // send work
                request.post({
                    url: postURLByWorker.get(mostAvailableWorker),
                    json: true,
                    body: {url: url},
                    gzip: true,
                    timeout: 24*ONE_HOUR
                }, function defaultRequestCallback(error){
                    if(error)
                        console.error('processURL error', url, error);
                });

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
