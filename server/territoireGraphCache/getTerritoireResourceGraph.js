"use strict";

var fork = require('child_process').fork;

var StringMap = require('stringmap');
//var Redis = require('ioredis');

var database = require('../../database');

var w = fork(require.resolve('./territoireGraphCache-worker'))

var terrIdToPromiseResolve = new Map();

/*var redisClient = new Redis({
    port: 6379,
    host: 'redis'//,
    //password: 'auth',
    //db: 0
})*/



w.on('message', function(res){
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

            terrIdToPromiseResolve.get(territoireId).resolve(res);
            terrIdToPromiseResolve.delete(territoireId);
            
        })
    
    
})


module.exports = function getTerritoireResourceGraph(territoireId){
    //console.log('getTerritoireResourceGraph', territoireId, terrIdToPromiseResolve.has(territoireId));
    
    if(terrIdToPromiseResolve.has(territoireId))
        return terrIdToPromiseResolve.get(territoireId).promise;
    else{
        var resolve;
        var p = new Promise(function(_resolve){ resolve = _resolve; });
        
        terrIdToPromiseResolve.set(territoireId, {
            promise: p,
            resolve: resolve
        });
        
        w.send({
            territoireId: territoireId
        });
        
        return p;
    } 
    
};
