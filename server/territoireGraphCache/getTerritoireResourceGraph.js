"use strict";

var fork = require('child_process').fork;

var StringMap = require('stringmap');
//var Redis = require('ioredis');



var w = fork(require.resolve('./territoireGraphCache-worker'))

var terrIdToPromiseResolve = new Map();

/*var redisClient = new Redis({
    port: 6379,
    host: 'redis'//,
    //password: 'auth',
    //db: 0
})*/



w.on('message', function(res){
    var id = res.territoireId;
    
    var receivedNodes = res.graph.nodes;
    var nodes = new StringMap();
    
    receivedNodes.forEach(function(n){
        nodes.set(String(n.id), n);
    })
    
    res.graph.nodes = nodes;
    res.graph.toJSON = function(){
        return {
            nodes: res.graph.nodes.values(),
            edges: res.graph.edges
        }
    }
    
    terrIdToPromiseResolve.get(id).resolve(res);
    terrIdToPromiseResolve.delete(id);
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
