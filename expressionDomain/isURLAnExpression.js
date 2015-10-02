"use strict";

var getRelevantHeuristic = require('./getRelevantHeuristic');

/*
    This function to decide whether a URL leads to a page with an expression
    It's based on the various heuristics black list
*/
module.exports = function(url){
    var heuristics = getRelevantHeuristic(url);
    var invalidPatterns = heuristics.invalidPatterns;
    
    // a URL is valid if it matches none of the matterns
    // also said as if every pattern don't match
    return invalidPatterns.every(function(pattern){        
        return !url.match(pattern);
    });
}
