"use strict";

var url = require('url');

var EXPRESSION_DOMAIN_NAME_PREFIX = 'facebook/';

/*
    This file implements the default expression domain heuristics, that is the last one after they all failed
*/

module.exports = {
    hostnames: [
        'facebook.com',
        'www.facebook.com',
        'fr-fr.facebook.com',
        'fr-ca.facebook.com'
    ],
    
    // NEVER use the g flag in regexps here. See https://twitter.com/erikcorry/status/231050692553502720
    invalidPatterns: [
        /^https?\:\/\/.*facebook\.com\/share.php/,
        /^https?\:\/\/.*facebook\.com\/sharer.php/,
        /^https?\:\/\/.*facebook\.com\/badges/,
        /^https?\:\/\/.*facebook\.com\/campaign\/landing.php/,
        /^https?\:\/\/.*facebook\.com\/careers/,
        /^https?\:\/\/.*facebook\.com\/directory/,
        /^https?\:\/\/.*facebook\.com\/help/,
        /^https?\:\/\/.*facebook\.com\/lite/,
        /^https?\:\/\/.*facebook\.com\/login/,
        /^https?\:\/\/.*facebook\.com\/mobile/,
        /^https?\:\/\/.*facebook\.com\/places/,
        /^https?\:\/\/.*facebook\.com\/r.php/,
        /^https?\:\/\/.*facebook\.com\/recover/,
        /^https?\:\/\/.*facebook\.com\/find-friends/
    ],
    
    getExpressionDomainName: function(u){  
        var parsedURL = url.parse(u, true);
        var pathname = parsedURL.pathname;
        var query = parsedURL.query;
        
        if(this.invalidPatterns.some(function(pattern){
            return !!u.match(pattern);
        })){
            return Promise.reject(new Error('Invalid URL'));
        }
        
        if(
            pathname === "/" ||
            pathname.startsWith('/policies/') ||
            pathname.startsWith('/privacy/')
        ){
            return Promise.resolve('facebook.com');
        }
        
        if(pathname.startsWith('/events'))
            return Promise.resolve(u);
        
        if(pathname.startsWith('/groups'))
            return Promise.resolve(EXPRESSION_DOMAIN_NAME_PREFIX + pathname.replace(/^\//, '').replace(/\/$/, ''));
        
        if(pathname === '/profile.php')      
            return Promise.resolve(EXPRESSION_DOMAIN_NAME_PREFIX + query.id);
        
        var matches = pathname.match(/^(\/pages)?\/([^\/]*)\/?.*$/);
        if(matches && matches[2])
            return Promise.resolve(EXPRESSION_DOMAIN_NAME_PREFIX + matches[2]);
        
        // This seems useless, but fail safe anyway
        return Promise.resolve(u);
    },
    
    getExpressionDomainInfos: function(u){
        console.log(u);
    }

}
