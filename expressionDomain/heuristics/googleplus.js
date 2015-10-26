"use strict";

var url = require('url');

var EXPRESSION_DOMAIN_NAME_PREFIX = 'Google+/';

module.exports = {
    hostnames: new Set([
        'plus.google.com'
    ]),
    
    // NEVER use the g flag in regexps here. See https://twitter.com/erikcorry/status/231050692553502720
    invalidPatterns: [
       /^https?\:\/\/.*plus\.google\.com\/app\/?/
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
            return Promise.resolve('plus.google.com');
        }
        
        var matches;
        
        matches = pathname.match(/^\/collection\/([^\/]*)$/);
        if(matches && matches[1])
            return Promise.resolve(EXPRESSION_DOMAIN_NAME_PREFIX + 'collection/' + decodeURI(matches[1]));
        
        matches = pathname.match(/^\/communities\/([^\/]*)\/?.*$/);
        if(matches && matches[1])
            return Promise.resolve(EXPRESSION_DOMAIN_NAME_PREFIX + 'communities/' + decodeURI(matches[1]));
        
        matches = pathname.match(/^\/events\/([^\/]*)\/?.*$/);
        if(matches && matches[1])
            return Promise.resolve(EXPRESSION_DOMAIN_NAME_PREFIX + 'events/' + decodeURI(matches[1]));
                
        
        matches = pathname.match(/^\/(\+?[^\/]*)\/?.*$/);
        if(matches && matches[1])
            return Promise.resolve(EXPRESSION_DOMAIN_NAME_PREFIX + decodeURI(matches[1]));
        
        
        return Promise.resolve(u);
    },
    
    getExpressionDomainInfos: function(u){
        
        return Promise.resolve({
            main_url: u            
        });
    }

}
