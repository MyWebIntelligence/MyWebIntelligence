"use strict";

var fork = require('child_process').fork;

var StringMap = require('stringmap');

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

                //console.log("rejectedResourceIds", rejectedResourceIds.toJSON());

                var receivedNodes = res.graph.nodes;
                var nodes = new StringMap();

                // remove rejected nodes
                receivedNodes.forEach(function(n){
                    //console.log('n.id', n.id, typeof n.id);

                    if(!rejectedResourceIds.has(n.id))
                        nodes.set(String(n.id), n);
                });


                res.graph.nodes = nodes;
                res.graph.toJSON = function(){
                    return {
                        nodes: res.graph.nodes.values(),

                        // remove edges referencing on either end a rejected node
                        edges: res.graph.edges.filter(function(e){
                            return !rejectedResourceIds.has(e.source) && !rejectedResourceIds.has(e.target);
                        })
                    }
                }

                terrIdToPromise.get(territoireId).resolve(res);
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
