"use strict";

var child_process = require('child_process');
var fork = child_process.fork;
var exec = child_process.exec;

var StringMap = require('stringmap');

var database = require('../../database');

var MAXIMUM_NICENESS = 19;

var ONE_HOUR = 60*60*1000;

var CACHE_ENTRY_NO_ACCESS_MAX_TIME = ONE_HOUR;

/*
    territoireId => mutable{
        graph: aGraph
        lastAccessTime?: timestamp
        builtTime: timestamp
    }
*/
var cache = new Map();

setTimeout(function cleanupCache(){
    setTimeout(cleanupCache, CACHE_ENTRY_NO_ACCESS_MAX_TIME/4);
    
    cache.forEach(function(entry, key){
        if(Date.now() - entry.lastAccessTime < CACHE_ENTRY_NO_ACCESS_MAX_TIME){
            // entry hasn't been accessed in a long time    
            cache.delete(key);
        }
    });
    
}, CACHE_ENTRY_NO_ACCESS_MAX_TIME/4);


var scheduledRefreshes = new Map/*<territoireId, Process>*/()

function refreshCacheEntry(territoireId){
    //console.log('refreshCacheEntry', territoireId);
    
    if(scheduledRefreshes.has(territoireId))
        return; // already scheduled
    
    var w = fork(require.resolve('./territoireGraphBuilder-worker'), [territoireId]);
    
    scheduledRefreshes.set(territoireId, w);
    
    w.on('message', function(graph){
        // it's the graph, 
        cache.set(territoireId, {
            graph: graph,
            buildTime: Date.now(),
            lastAccessTime: Date.now()
        });
        
        w.kill();
    });
    
    w.on('exit', function(){
        scheduledRefreshes.delete(territoireId);
    })
    
    exec( ['renice', '-n', MAXIMUM_NICENESS, w.pid].join(' ') );
}


module.exports = function(territoireId){
    var entry = cache.get(territoireId);
    
    console.log('territoireGraphCache entry', !!entry);
    
    if(entry){
        entry.lastAccessTime = Date.now();
        
        // schedule a refresh of the entry
        refreshCacheEntry(territoireId)
        
        return Promise.resolve({
            graph: entry.graph,
            buildTime: entry.buildTime 
        });
    }
    else{
        // schedule getting the full graph
        refreshCacheEntry(territoireId)

        // Get the territoire query results and make a graph out of that to be returned ASAP
        return database.complexQueries.getValidTerritoireQueryResultResources(territoireId)
            .then(function(resources){            
                var nodes = new StringMap();
            
                resources.forEach(function(res){
                    if(res.alias_of !== null)
                        return;

                    var idKey = String(res.id);

                    nodes.set(idKey, Object.assign({
                        depth: 0
                    }, res));
                });
            
                return {
                    nodes: nodes.values(),
                    edges: []
                };
            })
            .then(function(graph){
                return {
                    graph: graph,
                    complete: false 
                };
            })
    }
    
}
