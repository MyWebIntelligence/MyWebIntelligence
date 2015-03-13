"use strict";

var database = require('../database');

var approve = require('./approve');
var getExpression = require('./getExpression');

var stripURLHash = require('../common/stripURLHash');



/*
interface Expression{
    fullHTML: string
    mainHTML: string // stipped HTML containing only the useful content
    mainText: string // textual content of 'html'
    title: string // <title> or <h1>
    meta: Map<string, string>
    links: Set<string>
    aliases: Set<string>
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
    
    var todo = new Set(initialUrls._toArray().map(stripURLHash)); // clone
    var doing = new Set();
    var done = new Set();
    // var results = new Map(); // Map<urlAfterRedirect, result>()
    
    function crawl(depth){
        // console.log('internal crawl', depth, '|', todo.size, doing.size, done.size);
        return Promise.all(todo._toArray().map(function(u){
            todo.delete(u)
            doing.add(u);

            return getExpression(u)
                .then(function(expression){
                    doing.delete(u);
                    done.add(u);

                    var expressionSavedP;
                
                    if(approve({
                        depth: depth,
                        wordsToMatch: originalWords,
                        expression: expression
                        //citedBy: Set<URL>
                    })){
                        // save the expression only if it's approved
                        // expression may come from db or may be new or changed (added alias)
                        if(!expression._dontSave){ // save here
                            if('created_at' in expression)
                                expressionSavedP = database.Expressions.update(expression);    
                            else
                                expressionSavedP = database.Expressions.create(expression);
                        }
                        
                        //console.log('approved', u, expression);
                        expression.links.forEach(function(linkUrl){
                            if(!doing.has(linkUrl) && !done.has(linkUrl))
                                todo.add(linkUrl);
                        });
                    }
                    /*else{ // unapproved expression. Save later for
                    
                    }*/
                
                    return expressionSavedP;
                })
                .then(function(){
                    //console.log('crawl', todo.size, doing.size, done.size);
                    return todo.size >= 1 ? crawl(depth+1) : undefined;
                })
                .catch(function(err){
                    console.error('error while exploring the web', u, err, err.stack)
                });

        }));
    }
    
    // http://www.passeportsante.net/fr/Maux/Problemes/Fiche.aspx?doc=asthme_pm
    
    return crawl(0).then(function(){
        /*return {
            nodes: results,
            redirects: redirects
        }*/
    });
};
