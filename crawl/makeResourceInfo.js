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

function textContent(e){
    return e.textContent;
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
        var metaKeywords = document.querySelector('meta[name="keywords"]');
        var htmlElement = document.querySelector('html');
        
        // <hn>
        var h1 = Array.from(mainContent.querySelectorAll('h1')).map(textContent);
        var h2 = Array.from(mainContent.querySelectorAll('h2')).map(textContent);
        var h3 = Array.from(mainContent.querySelectorAll('h3')).map(textContent);
        var h4 = Array.from(mainContent.querySelectorAll('h4')).map(textContent);
        var h5 = Array.from(mainContent.querySelectorAll('h5')).map(textContent);
        var h6 = Array.from(mainContent.querySelectorAll('h6')).map(textContent);
        
        // emphasized texts
        var strong = Array.from(mainContent.querySelectorAll('strong')).map(textContent);
        var b = Array.from(mainContent.querySelectorAll('b')).map(textContent);
        var em = Array.from(mainContent.querySelectorAll('em')).map(textContent);
        var i = Array.from(mainContent.querySelectorAll('i')).map(textContent);

        var ret = {
            expression: {
                //fullHTML: html,
                main_html: mainContent.innerHTML,
                main_text: mainContent.textContent.trim(),
                
                title: document.title,
                
                "meta_description": (metaDesc && metaDesc.getAttribute('content')),
                "meta_keywords": ((metaKeywords && metaKeywords.getAttribute('content')) || '')
                    .split(',')
                    .map(function(k){ return k.trim(); })
                    .filter(function(k){ return k.length >= 1; }),
                
                html_lang: htmlElement.getAttribute('lang'),
                
                h1: h1,
                h2: h2,
                h3: h3,
                h4: h4,
                h5: h5,
                h6: h6,
                strong: strong,
                b: b,
                em: em,
                i: i
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
