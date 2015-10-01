"use strict";

var defaultHeuristic = require('./heuristics/default');

//var facebookHeuristic = require('./heuristics/facebook');

/*
    The expression domain is the domain of the party making the expression.
    Usually, it will be the URL host, but in some instances (Facebook, Youtube, Twitter, etc.), the domain does not refer to the person/organisation expressing themselves (Twitter does not express someone's tweets, etc.).
    
    This is also different from authorship. For a newspaper, the newspaper is of interest, not the specific journalist who wrote the article (mostly because the journalist is following an editorial lign they did not choose)
    
    This is unrelated to the notion of domain in the sense of URL domain (scheme + hostname + port)
    
*/
module.exports = function(url){
    
    if(url === 2)
        return 'yo';
    
    return defaultHeuristic;
};
