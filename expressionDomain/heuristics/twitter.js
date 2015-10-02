"use strict";

var url = require('url');

var EXPRESSION_DOMAIN_NAME_PREFIX = 'twitter/';

/*
    This file implements the default expression domain heuristics, that is the last one after they all failed
*/

module.exports = {
    hostnames: new Set([
        'twitter.com',
        'www.twitter.com',
        'mobile.twitter.com'
    ]),
    
    // NEVER use the g flag in regexps here. See https://twitter.com/erikcorry/status/231050692553502720
    invalidPatterns: [
       
    ],
    
    getExpressionDomainName: function(u){  
        var parsedURL = url.parse(u, true);
        var pathname = parsedURL.pathname;
        
        if(this.invalidPatterns.some(function(pattern){
            return !!u.match(pattern);
        })){
            return Promise.reject(new Error('Invalid URL'));
        }
        
        if(pathname === "/"){
            return Promise.resolve('twitter.com');
        }
        
        if(
            pathname === "/search" ||
            pathname.startsWith('/hashtag/')
        ){
            return Promise.resolve('twitter/search');
        }
        
        var matches = pathname.match(/^\/([^\/]+)(\/status\/.*)?$/);
        if(matches && matches[1])
            return Promise.resolve(EXPRESSION_DOMAIN_NAME_PREFIX + matches[1]);
        
        // Other urls are their own expression domain
        return Promise.resolve(u);
    },
    
    getExpressionDomainInfos: function(u){
        return Promise.resolve({
            main_url: u
        })
    }

}
