"use strict";

var StringMap = require('stringmap');

var database = require('../database');

// var ONE_HOUR = 60*60*1000;

/*
    territoireId => mutable{
        graph: aGraph
        lastAccessTime?: timestamp
        builtTime: timestamp
    }
*/
var cache = new Map();



var scheduledRefreshes = new Set/*<territoireId>*/()

function refreshCacheEntry(territoireId){
    console.log('refreshCacheEntry', territoireId);
    
    if(scheduledRefreshes.has(territoireId))
        return; // already scheduled
    
    scheduledRefreshes.add(territoireId);
    
    return database.complexQueries.getTerritoireGraph(territoireId)
        .then(function(graph){
            console.log('refreshCacheEntry', territoireId, 'done');
            cache.set(territoireId, {
                graph: graph,
                buildTime: Date.now()
            });
            scheduledRefreshes.delete(territoireId);
        })
}


module.exports = function(territoireId){
    var entry = cache.get(territoireId);
    
    console.log('territoireGraphCache', entry);
    
    if(entry){
        entry.lastAccessTime = Date.now();
        
        // schedule a refresh of the entry
        refreshCacheEntry(territoireId)
        
        return Promise.resolve({
            graph: entry.graph,
            complete: true 
        });
    }
    else{
        // schedule getting the full graph
        refreshCacheEntry(territoireId)

        // Get the territoire query results and make a graph out of that to be returned ASAP
        return database.complexQueries.getTerritoireQueryResults(territoireId)
            .then(database.Resources.findValidByURLs)
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
                    nodes: nodes,
                    edges: new Set(),
                    toJSON: function(){
                        return {
                            nodes: nodes.values(),
                            edges: []
                        }
                    }
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
