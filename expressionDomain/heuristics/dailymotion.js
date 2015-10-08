"use strict";

var url = require('url');

var wildcard = require('wildcard');

var providers = require('../oembed/providers.json');
var makeOembedHeuristicsHelper = require('../oembed/makeOembedHeuristicsHelper');

var EXPRESSION_DOMAIN_NAME_PREFIX = 'dailymotion/';

var dailymotionProvider = providers.find(function(p){
    return p.provider_name === "Dailymotion";
});

var oembedHelper = makeOembedHeuristicsHelper(dailymotionProvider.endpoints[0].url);

/*
    This file implements the default expression domain heuristics, that is the last one after they all failed
*/

module.exports = {
    hostnames: new Set([
        'dailymotion.com',
        'www.dailymotion.com'
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
            return Promise.resolve('dailymotion.com');
        }
        
        var matches = pathname.match(/^\/([A-Za-z]\w+)\/?$/);
        if(matches && matches[1])
            return Promise.resolve(EXPRESSION_DOMAIN_NAME_PREFIX + matches[1]);
        
        var schemes = dailymotionProvider.endpoints[0].schemes;
        
        if(schemes.some(function(s){ return wildcard(s, u); })){
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
