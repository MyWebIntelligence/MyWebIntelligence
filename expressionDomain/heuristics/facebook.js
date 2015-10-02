"use strict";

var url = require('url');

var EXPRESSION_DOMAIN_NAME_PREFIX = 'facebook/';

/*
    This file implements the default expression domain heuristics, that is the last one after they all failed
*/

module.exports = {
    hostnames: new Set([
        'facebook.com',
        'w.facebook.com',
        'ww.facebook.com',
        'www.facebook.com',
        'www2.facebook.com',
        'wwww.facebook.com',
        'fr-fr.facebook.com',
        'fr-ca.facebook.com',
        'el-gr.facebook.com',
        'es-la.facebook.com',
        'tl-ph.facebook.com',
        'es.facebook.com',
        'zh-cn.facebook.com',
        'fi-fi.facebook.com',
        'tr.facebook.com',
        'th-th.facebook.com',
        'dns.facebook.com',
        'ar-ar.facebook.com',
        'ja-jp.facebook.com',
        'id-id.facebook.com',
        'zh-tw.facebook.com',
        'et-ee.facebook.com',
        'nb-no.facebook.com',
        'fa-ir.facebook.com',
        'ro-ro.facebook.com',
        'fb-lt.facebook.com',
        'ru-ru.facebook.com',
        'nsa.facebook.com',
        'cs-cz.facebook.com',
        'pt-pt.facebook.com',
        'abc.facebook.com',
        'he-il.facebook.com',
        'vi-vn.facebook.com',
        'bg-bg.facebook.com',
        'da-dk.facebook.com',
        'sv-se.facebook.com',
        'en-gb.facebook.com',
        'de-de.facebook.com',
        'nl-nl.facebook.com',
        'zh-hk.facebook.com',
        'national.facebook.com',
        'it-it.facebook.com',
        'ro-ro.facebook.com',
        'fr.facebook.com',
        'nl.facebook.com',
        'zh-cn.facebook.com',
        'c.facebook.com',
        'tr-tr.facebook.com',
        'register.facebook.com',
        'es-es.facebook.com',
        'ko-kr.facebook.com',
        'hr-hr.facebook.com',
        'm.facebook.com',
        'it.facebook.com',
        'bs-ba.facebook.com',
        'ms-my.facebook.com',
        'secure.facebook.com',
        'sr-rs.facebook.com',
        'hu-hu.facebook.com',
        'pl-pl.facebook.com',
        'fb.com',
        'www.fb.com'
    ]),
    
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
