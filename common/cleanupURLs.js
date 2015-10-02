"use strict";

var url = require('url');

var stripURLHash = require('./stripURLHash');

var isURLAnExpression = require('../expressionDomain/isURLAnExpression');



/*
    urls is an Array<string>
    these strings can be any string, but want to be urls
*/
module.exports = function(urls){

    return urls 
        .map(function(u){ return u.trim(); })
        .filter(function(u){
            var parsed = url.parse(u);
    
            // keep only absolute URLs
            if(!parsed.protocol || !parsed.hostname)
                return false;
                    
            // remove non-http links, like javascript: and mailto: links
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        })
        .map(stripURLHash)
        // exclude URLs that are likely to end up being resources that we cannot process
        .filter(function(u){
            // the url doesn't end with any of the excluded file extensions
            // equivalent to: none of the extension terminates the url
            return isURLAnExpression(u);
        });
    
};
