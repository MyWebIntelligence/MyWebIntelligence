"use strict";

var url = require('url');

var wildcard = require('wildcard');

var providers = require('../oembed/providers.json');
var makeOembedHeuristicsHelper = require('../oembed/makeOembedHeuristicsHelper');

var EXPRESSION_DOMAIN_NAME_PREFIX = 'slideshare/';

var slideshareProvider = providers.find(function(p){
    return p.provider_name === "SlideShare";
});

var oembedHelper = makeOembedHeuristicsHelper(slideshareProvider.endpoints[0].url);

/*
    This file implements the default expression domain heuristics, that is the last one after they all failed
*/

module.exports = {
    hostnames: new Set([
        'slideshare.net',
        'www.slideshare.net',
        'slideshare.com',
        'es.slideshare.net',
        'pt.slideshare.net',
        'fr.slideshare.net',
        'de.slideshare.net'
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
        
        if(
            pathname === "/" ||
            pathname === "/about" ||
            pathname === "/privacy" ||
            pathname === "/terms"
          ){
            return Promise.resolve('slideshare.net');
        }
        
        var matches = pathname.match(/^\/([^\/]+)\/?$/);
        if(matches && matches[1])
            return Promise.resolve(EXPRESSION_DOMAIN_NAME_PREFIX + matches[1]);
        
        var schemes = slideshareProvider.endpoints[0].schemes;
        
        var wwwu = url.format(
            Object.assign(
                {},
                parsedURL,
                // currently, the slideshare provider scheme does not have access to localized versions
                // pending https://github.com/iamcal/oembed/pull/103
                {
                    host: 'www.slideshare.net'
                }
            )
        );
                
        if(schemes.some(function(s){ return wildcard(s, wwwu); })){
            return oembedHelper(u).then(function(oembedInfos){
                return EXPRESSION_DOMAIN_NAME_PREFIX + oembedInfos.author_name;
            });
        }
        
        // Other urls are their own expression domain
        return Promise.resolve(u);
    },
    
    getExpressionDomainInfos: function(u){
        var schemes = slideshareProvider.endpoints[0].schemes;
        
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
