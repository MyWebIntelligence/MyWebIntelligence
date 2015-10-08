"use strict";

var url = require('url');

var EXPRESSION_DOMAIN_NAME_PREFIX = 'linkedin/';


module.exports = {
    hostnames: new Set([
        "linkedin.com",
        "af.linkedin.com",
        "al.linkedin.com",
        "dz.linkedin.com",
        "ar.linkedin.com",
        "au.linkedin.com",
        "at.linkedin.com",
        "bh.linkedin.com",
        "bd.linkedin.com",
        "be.linkedin.com",
        "bo.linkedin.com",
        "ba.linkedin.com",
        "br.linkedin.com",
        "bg.linkedin.com",
        "ca.linkedin.com",
        "cl.linkedin.com",
        "cn.linkedin.com",
        "co.linkedin.com",
        "cr.linkedin.com",
        "hr.linkedin.com",
        "cy.linkedin.com",
        "cz.linkedin.com",
        "dk.linkedin.com",
        "do.linkedin.com",
        "ec.linkedin.com",
        "eg.linkedin.com",
        "sv.linkedin.com",
        "ee.linkedin.com",
        "fi.linkedin.com",
        "fr.linkedin.com",
        "de.linkedin.com",
        "gh.linkedin.com",
        "gr.linkedin.com",
        "gt.linkedin.com",
        "hk.linkedin.com",
        "hu.linkedin.com",
        "is.linkedin.com",
        "in.linkedin.com",
        "id.linkedin.com",
        "ir.linkedin.com",
        "ie.linkedin.com",
        "il.linkedin.com",
        "it.linkedin.com",
        "jm.linkedin.com",
        "jp.linkedin.com",
        "jo.linkedin.com",
        "kz.linkedin.com",
        "ke.linkedin.com",
        "kr.linkedin.com",
        "kw.linkedin.com",
        "lv.linkedin.com",
        "lb.linkedin.com",
        "lt.linkedin.com",
        "lu.linkedin.com",
        "mk.linkedin.com",
        "my.linkedin.com",
        "mt.linkedin.com",
        "mu.linkedin.com",
        "mx.linkedin.com",
        "ma.linkedin.com",
        "np.linkedin.com",
        "nl.linkedin.com",
        "nz.linkedin.com",
        "ng.linkedin.com",
        "no.linkedin.com",
        "om.linkedin.com",
        "pk.linkedin.com",
        "pa.linkedin.com",
        "pe.linkedin.com",
        "ph.linkedin.com",
        "pl.linkedin.com",
        "pt.linkedin.com",
        "pr.linkedin.com",
        "qa.linkedin.com",
        "ro.linkedin.com",
        "ru.linkedin.com",
        "sa.linkedin.com",
        "sg.linkedin.com",
        "sk.linkedin.com",
        "si.linkedin.com",
        "za.linkedin.com",
        "es.linkedin.com",
        "lk.linkedin.com",
        "se.linkedin.com",
        "ch.linkedin.com",
        "tw.linkedin.com",
        "tz.linkedin.com",
        "th.linkedin.com",
        "tt.linkedin.com",
        "tn.linkedin.com",
        "tr.linkedin.com",
        "ug.linkedin.com",
        "ua.linkedin.com",
        "ae.linkedin.com",
        "uk.linkedin.com",
        "www.linkedin.com",
        "uy.linkedin.com",
        "ve.linkedin.com",
        "vn.linkedin.com",
        "zw.linkedin.com"
    ]),
    
    // NEVER use the g flag in regexps here. See https://twitter.com/erikcorry/status/231050692553502720
    invalidPatterns: [
        /^https?\:\/\/.*linkedin\.com\/shareArticle.*$/,
        'http://www.linkedin.com/legal/copyright-policy',
        /^https?\:\/\/.*linkedin\.com\/pub\/dir.*$/
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
            return Promise.resolve('linkedin.com');
        }
        
        var matches = pathname.match(/^\/company\/([^\/]+)$/);
        if(matches && matches[1])
            return Promise.resolve(EXPRESSION_DOMAIN_NAME_PREFIX + 'company/' + matches[1]);
        
        matches = pathname.match(/^\/pub\/([^\/]+)\/?/);
        if(matches && matches[1])
            return Promise.resolve(EXPRESSION_DOMAIN_NAME_PREFIX + matches[1]);
        
        matches = pathname.match(/^\/in\/([^\/]+)\/?/);
        if(matches && matches[1])
            return Promise.resolve(EXPRESSION_DOMAIN_NAME_PREFIX + matches[1]);
        
        // Other urls are their own expression domain
        return Promise.resolve(u);
    },
    
    getExpressionDomainInfos: function(u){
        return Promise.resolve({
            main_url: u
        })
    }

}
