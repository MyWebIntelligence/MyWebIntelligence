"use strict";

var os = require('os');
var fork = require('child_process').fork;

var promiseResolveRejectByURL = new Map();
var pendingURLByWorker = new WeakMap();

var getExpressionWorkers = os.cpus().map(function(){
    var worker = fork( require.resolve('./getExpression-child-process.js'), {silent: false} );
    
    worker.on('message', function(response){
        var url = response.url;
        
        if(response.error){
            console.error('resp err', url, response.error);
        }
        else{
            var expression = response.expression;

            console.log('resp', url);

            var resolve = promiseResolveRejectByURL.get(url).resolve;
            resolve(expression);
        }
        
        promiseResolveRejectByURL.delete(url);
        pendingURLByWorker.get(worker).delete(url);
        
        console.log(getExpressionWorkers.map(function(w){ return pendingURLByWorker.get(w).size }));
    });
    
    pendingURLByWorker.set(worker, new Set());
    
    return worker;
});


/*
    Fetch the URL (to get redirects and the body)
    Extract core content (from readability or otherwise).
*/
module.exports = function getExpression(url){
    //console.log('scheduler', url);
    
    if(promiseResolveRejectByURL.has(url))
        return promiseResolveRejectByURL.get(url).promise;
    
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
        mostAvailableWorker.send(url);
        
        var pendingURLs = pendingURLByWorker.get(mostAvailableWorker);
        pendingURLs.add(url);
    });
    
    promiseResolveRejectByURL.set(url, {
        promise: p,
        resolve: resolve,
        reject: reject
    });
    
    return p;
};
