"use strict";

var tld = require('tldjs');

var database = require('../database');

/*
    This module attempts to estimate an expression domain potential audience.
    The potential audience is some fuzzy form of maximum amount of people that can be reached by an expression 
    in the expression domain
    
    For regular expression domains (hostnames), it will take the AlexaRank and estimate the audience off of that
    For Twitter, it'll return the number of followers (via expression domain heuristics)
    For Facebook the number of followers or friends (via expression domain heuristics)
    etc. 
    
    This function returns undefined if the potential audience cannot be estimated
*/

var pow = Math.pow;

function alexaRankToPotentialAudience(alexaRank){
    return Math.round(pow(10, 9)*1/alexaRank);
}

module.exports = function(ed){
    console.log('estimatePotentialAudience', ed);
    
    if(ed.name.includes('.') && !ed.name.includes('/')){
        // 'expression domain === hostname' case
        var hostname = ed.name;
        var domain = tld.getDomain(hostname);

        console.log('estimatePotentialAudience domain', domain);
        
        return database.AlexaRankCache.findByDomains(new Set([domain]))
        .then(function(arEntries){
            var areEntry = arEntries[0];
            console.log('estimatePotentialAudience areEntry', domain, areEntry);
            if(!areEntry){
                return undefined;
            }
            
            return alexaRankToPotentialAudience(areEntry.rank);
        });
    }
    else{
        return undefined; 
        // for now. Eventually, find the expression domain and call the corresponding audience estimation function
    }
}
