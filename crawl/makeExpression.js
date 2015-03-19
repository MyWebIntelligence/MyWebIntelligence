"use strict";

var makeDocument = require('../common/makeDocument');
var stripURLHash = require('../common/stripURLHash');

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
            console.warn(e);
            return fullJSDOMDocumentP.then(extractMainContent)
        });
    
    return Promise.all([fullJSDOMDocumentP, mainContentP]).then(function(result){
        var document = result[0].document;
        var fullDocumentDispose = result[0].dispose;
        
        var mainContent = result[1].mainContent;
        var mainContentDispose = result[1].dispose;
    
        // links
        var links = Array.from(mainContent.querySelectorAll('a[href]'));

        var urls = links
            .map(function(a){ return a.href.trim() })
            // remove non-http links, like javascript: and mailto: links
            .filter(function(u){ return /^https?/.test(u); })
            .map(stripURLHash)

        var uniqueLinks = new Set(urls);

        // remove self-references
        uniqueLinks.delete(url);

        // meta description
        var metaDesc = document.querySelector('meta[name="description"]');
        
        
        var ret = {
            uri: url,
            //fullHTML: html,
            mainHTML: mainContent.outerHTML,
            mainText: mainContent.textContent.trim(),
            title: document.title,
            references: uniqueLinks,
            "meta-description": metaDesc && metaDesc.getAttribute('content')
        };
        
        // free memory
        fullDocumentDispose();
        if(mainContentDispose !== fullDocumentDispose) // may happen if mainContent was extracted from fullDocument
            mainContentDispose();
        
        return ret;
    });
    
};
