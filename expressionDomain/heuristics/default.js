"use strict";

var url = require('url');

var request = require('request');

var makeDocument = require('../../common/makeDocument');

/*
    This file implements the default expression domain heuristics, that is the last one after they all failed
*/

module.exports = {
    hostnames: new Set(['*']), // irrelevant
    
    invalidPatterns: [
        // These links usually end up being resources that are heavy to download and that we cannot process yet.
        
        // documents
        /\.pdf$/,
        /\.doc$/,
        /\.docx$/,
        /\.ppt$/,
        /\.pptx$/,
        /\.xls$/,
        /\.xlsx$/,
    
        // archives
        /\.zip$/,
        /\.tar.gz$/,
        /\.tar$/,
        /\.gz$/,
        /\.rar$/,
    
        // images
        /\.png$/,
        /\.eps$/,
        /\.jpg$/,
        /\.jpeg$/
    ],
    
    getExpressionDomainName: function(u){  
        var hostname = url.parse(u).hostname;
        var expressionDomain = hostname;

        return Promise.resolve(expressionDomain);
    },
    
    getExpressionDomainInfos: function(u){
        var parsedURL = url.parse(u);
        // keep only protocol and hostname
        delete parsedURL.auth;
        delete parsedURL.port;
        delete parsedURL.host;
        delete parsedURL.query;
        delete parsedURL.search;
        delete parsedURL.hash;

        parsedURL.pathname = '/';

        var expressionDomainBaseURL = url.format(parsedURL);
        
        return new Promise(function(resolve, reject){
            request(expressionDomainBaseURL, function(error, response, body){
                if(error){
                    reject(error);
                    return;
                }
    
                makeDocument(body, expressionDomainBaseURL).then(function(result){ 
                    var document = result.document;
                    var documentDispose = result.dispose;

                    // meta description
                    var metaDesc = document.querySelector('meta[name="description"]');
                    var metaKeywords = document.querySelector('meta[name="keywords"]');

                    var ret = {
                        main_url: expressionDomainBaseURL,
                        title: document.title,
                        description: (metaDesc && metaDesc.getAttribute('content')),
                        keywords: ((metaKeywords && metaKeywords.getAttribute('content')) || '')
                            .split(',')
                            .map(function(k){ return k.trim(); })
                            .filter(function(k){ return k.length >= 1; })
                    };

                    // free memory
                    documentDispose();

                    resolve(ret);
                })
            })
        })
    }

}
