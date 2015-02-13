"use strict";

var Set = require('es6-set');

// The fetch module takes care of redirects, per-domain throttling all that
var fetch = require('./fetch');
var extractContent = require('./extractContent');

/*
interface EffectiveDocument{
    html: string // stipped HTML containing only the useful content
    title: string // <title> or <h1>
    meta: Map<string, string>
    links: Set<string>
}

// ignoring intermediate redirects
interface FetchedDocument{
    originalURL: string
    URLAfterRedirects : string
    html: string
}
*/


/*
    urls: Set<string>
    originalWords: Set<string>
    
    @return Promise<CrawlResult> which is sort of a graph
*/
module.exports = function(initialUrls, originalWords){
    var todo = new Set(initialUrls); // clone
    var doing = new Set();
    var done = new Set();
    var results = new Map(); // Map<urlAfterRedirect, result>()
    var redirects = new Map(); 
    
    function approve(fetchedDocument){
        throw 'TODO';
    }
    
    function crawl(){
        return Promise.all(todo.map(function(u){
            todo.remove(u)
            doing.add(u);

            return fetch(u)
                .then(function(fetchedDocument){
                    if(fetchedDocument.originalURL !== fetchedDocument.URLAfterRedirects){
                        redirects.set(fetchedDocument.originalURL, fetchedDocument.URLAfterRedirects);
                    }
                
                    var effectiveDocument = extractEffectiveDocument(fetchedDocument.html);
                    doing.remove(u);
                    results.set(fetchedDocument.URLAfterRedirects, effectiveDocument);
                    done.add(u);
                
                    if(approve(fetchedDocument)){
                        effectiveDocument.links.forEach(function(u){
                            if(!doing.has(u) && !done.has(u) && !results.has(u))
                                todo.add(u);
                        });
                    }
                })
                .then(function(){
                    return todo.size >= 1 ? crawl() : undefined;
                });

        }));
    }
    
    return crawl().then(function(){
        return {
            nodes: done,
            redirects: redirects
        }
    });
};
