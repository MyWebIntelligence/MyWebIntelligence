"use strict";

var makeDocument = require('../common/makeDocument');
var stripURLHash = require('../common/stripURLHash');

var getReadabilityAPIMainContent = require('./getReadabilityAPIMainContent');

/*
    These links usually end up being resources that are heavy to download and that we cannot process yet.
    They will be ignored
*/
var EXCLUDED_FILE_EXTENSIONS = [
    // documents
    '.pdf',
    '.doc',
    '.docx',
    '.ppt',
    '.pptx',
    '.xls',
    '.xlsx',
    
    // archives
    '.zip',
    '.tar.gz',
    '.tar',
    '.gz',
    '.rar',
    
    // images
    '.png',
    '.eps',
    '.jpg',
    '.jpeg'
];

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

        var urls = links
            .map(function(a){ return a.href.trim() })
            // remove non-http links, like javascript: and mailto: links
            .filter(function(u){ return /^https?/.test(u); })
            .map(stripURLHash)
            // exclude URLs that are likely to end up being resources that we cannot process
            .filter(function(u){
                // the url doesn't end with any of the excluded file extensions
                // equivalent to: every extension does not terminate the url
                return EXCLUDED_FILE_EXTENSIONS.every(function(ext){
                    return !u.endsWith(ext);
                });
            });
        
        var uniqueLinks = new Set(urls);

        // remove self-references
        uniqueLinks.delete(url);

        // meta description
        var metaDesc = document.querySelector('meta[name="description"]');
        
        var ret = {
            uri: url,
            //fullHTML: html,
            main_html: mainContent.innerHTML,
            main_text: mainContent.textContent.trim(),
            title: document.title,
            references: uniqueLinks,
            "meta_description": (metaDesc && metaDesc.getAttribute('content')) || ''
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
