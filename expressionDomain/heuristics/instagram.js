"use strict";

var url = require('url');

var wildcard = require('wildcard');

var providers = require('../oembed/providers.json');
var makeOembedHeuristicsHelper = require('../oembed/makeOembedHeuristicsHelper');

var EXPRESSION_DOMAIN_NAME_PREFIX = 'instagram/';

var instagramProvider = providers.find(function(p){
    return p.provider_name === "Instagram";
});

var oembedHelper = makeOembedHeuristicsHelper(instagramProvider.endpoints[0].url);

/*
    This file implements the default expression domain heuristics, that is the last one after they all failed
*/

module.exports = {
    hostnames: new Set([
        'instagram.com',
        'www.instagram.com',
        'instagr.am',
        'www.instagr.am'
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
            return Promise.resolve('instagram.com');
        }
        
        
        var matches = pathname.match(/^\/(\w+)\/?$/);
        if(matches && matches[1])
            return Promise.resolve(EXPRESSION_DOMAIN_NAME_PREFIX + matches[1]);
        
        var schemes = instagramProvider.endpoints[0].schemes;
        
        var httpu = url.format(
            Object.assign(
                {},
                parsedURL,
                // currently, the instagram provider scheme only takes http into account
                // pending https://github.com/iamcal/oembed/pull/105
                {
                    protocol: 'http'
                }
            )
        );
        
        if(schemes.some(function(s){ return wildcard(s, httpu); })){
            return oembedHelper(u).then(function(oembedInfos){
                return EXPRESSION_DOMAIN_NAME_PREFIX + oembedInfos.author_name;
            });
        }
        
        return Promise.resolve(u);
    },
    
    getExpressionDomainInfos: function(u){
        
        return Promise.resolve({
            main_url: u            
        });
    }

}
