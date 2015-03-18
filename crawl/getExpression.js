"use strict";

var fetch = require('./fetch');
var makeExpression = require('./makeExpression');

var database = require('../database');

/*
    Fetch the URL (to get redirects and the body)
    Extract core content (from readability or otherwise).
*/
module.exports = function(url){
    return database.Expressions.findByURIAndAliases(new Set([url])).then(function(expressions){
        if(expressions[0]){ // url already has an entry in the database
            // to not resave a document extracted as is from the DB.
            // Sorry for double negative. Alternative would be setting true to most of objects (and maybe forget to)
            expressions[0]._dontSave = true; 
            return expressions[0];
        }
        else{
            return fetch(url).then(function(fetchedDocument){
                var canonicalURL = fetchedDocument.canonicalURL;
                
                if(canonicalURL !== fetchedDocument.originalURL){
                    // it's unlikely, but there may already be an entry for the canonicalURL
                    return database.Expressions.findByCanonicalURI(canonicalURL).then(function(expr){
                        if(expr){
                            // new alias found apparently
                            if(!Array.isArray(expr.aliases))
                                expr.aliases = [];
                            
                            expr.aliases.push(fetchedDocument.originalURL);
                                
                            return expr;
                        }
                        else{
                            return makeExpression(canonicalURL, fetchedDocument).then(function(expr){
                                expr.aliases = [fetchedDocument.originalURL];
                                return expr;
                            });
                        }
                    });
                }
                else{
                    return makeExpression(canonicalURL, fetchedDocument.html);
                }
            });
        }
    });
};
