"use strict";

var immutableMap = require('immutable').Map;

var serverAPI = require('./index');

var cachedRanks = immutableMap();

module.exports = function(hostnames /* Set<hostname> */){
    // test whether all the hostnames are available as keys
    // if not, fetch the missing ones, otherwise, return current cached version
    var missingHostnames = new Set();
    
    hostnames.forEach(function(h){
        if(!cachedRanks.has(h))
            missingHostnames.add(h);
    });
    
    if(missingHostnames.size === 0)
        return Promise.resolve(cachedRanks);
    else{
        return serverAPI.getAlexaRanks(missingHostnames)
            .then(function(ranks){
                console.log("server ranks", cachedRanks.size, ranks.length);
            
                cachedRanks = cachedRanks.withMutations(function(map){
                    ranks.forEach(function(r){
                        map.set(r.site_domain, r.rank);
                    });
                });
            
                console.log("cachedRanks", cachedRanks.size);
            
                return cachedRanks;
            })
    }
    
    
};
