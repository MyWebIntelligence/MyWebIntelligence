"use strict";

// The fetch module takes care of redirects, per-domain throttling all that
var fetch = require('./fetch');
var extractEffectiveDocument = require('./extractEffectiveDocument');

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
    originalWords = originalWords || new Set();
    
    //console.log('crawl call', initialUrls.size, originalWords._toArray());
    
    var todo = new Set(initialUrls); // clone
    var doing = new Set();
    var done = new Set();
    var results = new Map(); // Map<urlAfterRedirect, result>()
    var redirects = new Map(); 
    
    var EVAPORATION_FACTOR = 0.5;
    var approvalProbability = 1;
    
    // Approving is deciding to follow the links of the page (not whether to fetch the page)
    function approve(fetchedDocument){
        //approvalProbability *= EVAPORATION_FACTOR;
    
        // TODO
        return true; // Math.random() < approvalProbability;
    }
    
    function crawl(depth){
        // console.log('internal crawl', depth, '|', todo.size, doing.size, done.size);
        return Promise.all(todo._toArray().map(function(u){
            todo.delete(u)
            doing.add(u);

            return fetch(u)
                .then(function(fetchedDocument){
                    if(fetchedDocument.originalURL !== fetchedDocument.URLAfterRedirects){
                        redirects.set(fetchedDocument.originalURL, fetchedDocument.URLAfterRedirects);
                    }
                
                    return extractEffectiveDocument(fetchedDocument.URLAfterRedirects)
                        .then(function(effectiveDocument){
                            doing.delete(u);
                            results.set(fetchedDocument.URLAfterRedirects, effectiveDocument);
                            done.add(u);
                        
                            //console.log('yo', fetchedDocument.URLAfterRedirects, effectiveDocument); 

                            if(approve(fetchedDocument)){
                                effectiveDocument.links/*._randomSubset(depth < 1 ? 2 : 0)*/.forEach(function(u){
                                    if(!doing.has(u) && !done.has(u) && !results.has(u))
                                        todo.add(u);
                                });
                            }
                        });
                })
                .then(function(){
                    return todo.size >= 1 ? crawl(depth+1) : undefined;
                })
                .catch(function(err){
                    console.error('error while exploring the web', u, err)
                });

        }));
    }
    
    // http://www.passeportsante.net/fr/Maux/Problemes/Fiche.aspx?doc=asthme_pm
    
    return crawl(0).then(function(){
        return {
            nodes: results,
            redirects: redirects
        }
    });
};
