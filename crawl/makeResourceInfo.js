"use strict";

var makeDocument = require('../common/makeDocument');
var cleanupURLs = require('../common/cleanupURLs');

var getReadabilityAPIMainContent = require('./getReadabilityAPIMainContent');


function extractMainContent(o){
    // TODO eventually, use Mozilla's readability
    return {
        mainContent: o.document.querySelector('main, article, content, #main, .main, #article, .article, #content, .content, body'),
        dispose: o.dispose
    }
}

/*
    url is expected to be the canonical URL
*/
module.exports = function(url, html){
    
    var fullJSDOMDocumentP = makeDocument(html, url);
    
    // Promise<HTMLElement>
    var mainContentP = getReadabilityAPIMainContent(url)
        .catch(function(e){
            console.warn('Readability API issue. extracting content from main document', url, e);
            return fullJSDOMDocumentP.then(extractMainContent)
        });
    
    return Promise.all([fullJSDOMDocumentP, mainContentP]).then(function(result){
        var document = result[0].document;
        var fullDocumentDispose = result[0].dispose;
        
        var mainContent = result[1].mainContent;
        var mainContentDispose = result[1].dispose;
    
        // links
        var links = Array.from(mainContent.querySelectorAll('a[href]'));
        
        var uniqueLinks = new Set(cleanupURLs(links.map(function(a){ return a.href; })));

        // remove self-references
        uniqueLinks.delete(url);

        // meta description
        var metaDesc = document.querySelector('meta[name="description"]');
        
        var ret = {
            expression: {
                //fullHTML: html,
                main_html: mainContent.innerHTML,
                main_text: mainContent.textContent.trim(),
                title: document.title,
                "meta_description": (metaDesc && metaDesc.getAttribute('content'))
            },
            links: uniqueLinks
        };
        
        // free memory
        fullDocumentDispose();
        if(mainContentDispose !== fullDocumentDispose) // may happen if mainContent was extracted from fullDocument
            mainContentDispose();
        
        return ret;
    })
    .catch(function(e){
        console.error('makeExpression error', url, e, e.stack);
        throw e;
    });
    
};
