"use strict";

var fork = require('child_process').fork;

var database = require('../../database');


var terrIdToPromise = new Map/*<territoireId, {promise, resolve, reject}>*/();

// This variable should at all time contain an alive and working worker
var worker;

(function makeTerritoireGraphCacheWorker(){
    worker = fork(require.resolve('./territoireGraphCache-worker'))

    worker.on('message', function(res){
        var territoireId = res.territoireId;

        // Need to remove resources annotated for rejection as the territoire cache may not be up-to-date on them
        database.ResourceAnnotations.findNotApproved(territoireId)
            .then(function(rejectedAnns){

                var rejectedResourceIds = new Set(rejectedAnns.map(function(r){
                    return r.resource_id;
                }));

                // remove rejected resources from the graph
                res.graph.nodes = res.graph.nodes.filter(function(n){
                    return !rejectedResourceIds.has(n.id) 
                });
                res.graph.edges = res.graph.edges.filter(function(e){
                    return !rejectedResourceIds.has(e.source) && !rejectedResourceIds.has(e.target);
                });

                terrIdToPromise.get(territoireId).resolve(res);
                terrIdToPromise.delete(territoireId);         
            })
            .catch(function(e){
                console.error('Error trying to resolve territoire cache promise', e, e.stack);
                terrIdToPromise.get(territoireId).reject(new Error('Error trying to resolve territoire cache promise '+ String(e)+' '+String(e.stack)));
                terrIdToPromise.delete(territoireId); 
            });
    });
    
    // in case the worker dies for any reason (memory exhaustion is the most likely cause)
    worker.on('exit', function(){
        // just respawn another one
        makeTerritoireGraphCacheWorker();
        
        // cancel pending territoire cache requests
        terrIdToPromise.forEach(function(promiseResolveReject, terrId){
            promiseResolveReject.reject(new Error('Territoire cache worker died'));
            terrIdToPromise.delete(terrId);
        });
    }); 
    
})();



module.exports = function getTerritoireResourceGraph(territoireId){
    //console.log('getTerritoireResourceGraph', territoireId, terrIdToPromise.has(territoireId));
    
    if(terrIdToPromise.has(territoireId))
        return terrIdToPromise.get(territoireId).promise;
    else{
        var resolve, reject;
        var p = new Promise(function(_resolve, _reject){ resolve = _resolve; reject = _reject; });
        
        terrIdToPromise.set(territoireId, {
            promise: p,
            resolve: resolve,
            reject: reject
        });
        
        worker.send({
            territoireId: territoireId
        });
        
        return p;
    } 
    
};
