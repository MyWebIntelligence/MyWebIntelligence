"use strict";

var url = require('url');

var wildcard = require('wildcard');

var providers = require('../oembed/providers.json');
var makeOembedHeuristicsHelper = require('../oembed/makeOembedHeuristicsHelper');

var EXPRESSION_DOMAIN_NAME_PREFIX = 'vimeo/';

var vimeoProvider = providers.find(function(p){
    return p.provider_name === "Vimeo";
});

var oembedHelper = makeOembedHeuristicsHelper(vimeoProvider.endpoints[0].url);

/*
    This file implements the default expression domain heuristics, that is the last one after they all failed
*/

module.exports = {
    hostnames: new Set([
        'vimeo.com',
        'www.vimeo.com'
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
            return Promise.resolve('vimeo.com');
        }
        
        var matches = pathname.match(/^\/([A-Za-z]+)\/?$/);
        if(matches && matches[1])
            return Promise.resolve(EXPRESSION_DOMAIN_NAME_PREFIX + matches[1]);
        
        var schemes = vimeoProvider.endpoints[0].schemes;
        
        var httpu = url.format(
            Object.assign(
                {},
                parsedURL,
                // currently, the vimeo provider scheme only takes http into account
                // pending https://github.com/iamcal/oembed/pull/104
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
