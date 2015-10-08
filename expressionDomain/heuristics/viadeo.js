"use strict";

// var url = require('url');

// var EXPRESSION_DOMAIN_NAME_PREFIX = 'viadeo/';

module.exports = {
    hostnames: new Set([
        'viadeo.com',
        'fr.viadeo.com',
        'www.viadeo.com'
    ]),
    
    // NEVER use the g flag in regexps here. See https://twitter.com/erikcorry/status/231050692553502720
    invalidPatterns: [
       
    ],
    
    getExpressionDomainName: function(u){
        
        // Quick and dirty implementation. This is a step forward anyway from the situation without it
        return Promise.resolve(u);
    },
    
    getExpressionDomainInfos: function(u){
        
        return Promise.resolve({
            main_url: u            
        });
    }

}
