"use strict";

// var url = require('url');

// var EXPRESSION_DOMAIN_NAME_PREFIX = 'pinterest/';

module.exports = {
    hostnames: new Set([
        'pinterest.com',
        'fr.pinterest.com',
        'br.pinterest.com',
        'de.pinterest.com',
        'es.pinterest.com',
        'fr.pinterest.com',
        'gb.pinterest.com',
        'gr.pinterest.com',
        'in.pinterest.com',
        'it.pinterest.com',
        'jp.pinterest.com',
        'kr.pinterest.com',
        'nl.pinterest.com',
        'no.pinterest.com',
        'pl.pinterest.com',
        'pt.pinterest.com',
        'ru.pinterest.com',
        'se.pinterest.com',
        'sk.pinterest.com',
        'tr.pinterest.com',
        'uk.pinterest.com',
        'www.pinterest.com'
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
