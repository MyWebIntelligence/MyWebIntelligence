"use strict";

var url = require('url');

var wildcard = require('wildcard');

var providers = require('../oembed/providers.json');
var makeOembedHeuristicsHelper = require('../oembed/makeOembedHeuristicsHelper');

var EXPRESSION_DOMAIN_NAME_PREFIX = 'youtube/';

var youtubeProvider = providers.find(function(p){
    return p.provider_name === "YouTube";
});

var oembedHelper = makeOembedHeuristicsHelper(youtubeProvider.endpoints[0].url);

/*
    This file implements the default expression domain heuristics, that is the last one after they all failed
*/

module.exports = {
    hostnames: new Set([
        'youtube.com',
        'www.youtube.com'
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
            return Promise.resolve('youtube.com');
        }
        
        if(pathname === "/watch"){
            return oembedHelper(u).then(function(oembedInfos){
                var authorName = oembedInfos.author_name;

                return authorName ?
                    EXPRESSION_DOMAIN_NAME_PREFIX + authorName :
                    u;
            });
        }
        
        var matches = pathname.match(/^\/(user\/)?([^\/]+)\/?$/);
        if(matches && matches[2])
            return Promise.resolve(EXPRESSION_DOMAIN_NAME_PREFIX + matches[2]);
        
        matches = pathname.match(/^\/channel\/([^\/]+)\/?$/);
        if(matches && matches[1])
            return Promise.resolve(EXPRESSION_DOMAIN_NAME_PREFIX + 'channel/' + matches[1]);
        
        return Promise.resolve(u);
    },
    
    getExpressionDomainInfos: function(u){
        var schemes = youtubeProvider.endpoints[0].schemes;
        
        if(schemes.some(function(s){ return wildcard(s, u); })){
            return oembedHelper(u).then(function(oembedInfos){
                return {
                    main_url: oembedInfos.author_url
                };
            });
        }
        
        return Promise.resolve(undefined);
    }

}
