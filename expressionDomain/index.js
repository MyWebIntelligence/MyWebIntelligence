"use strict";

var parseURL = require('url').parse;

/*
    The expression domain is the domain of the party making the expression.
    Usually, it will be the URL host, but in some instances (Facebook, Youtube, Twitter, etc.), the domain does not refer to the person/organisation expressing themselves (Twitter does not express someone's tweets, etc.).
    
    This is also different from authorship. For a newspaper, the newspaper is of interest, not the specific journalist who wrote the article (mostly because the journalist is following an editorial lign they did not choose)
    
    This is unrelated to the notion of domain in the sense of URL domain (scheme + hostname + port)
    
    
    Super-naïve first version just getting the hostname.
    It is expected that in a later version the expression domain may require fetching the page to gather more info about the expression domain, hence returning a Promise and not the string directly.
    It is also expected that this script/directory will become its own repo and npm package when the right time comes.
    
*/
module.exports = function(url){
    
    var hostname = parseURL(url).hostname;
    var expressionDomain = hostname;
    
    return Promise.resolve(expressionDomain);
};
