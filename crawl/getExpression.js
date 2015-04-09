"use strict";

var fetch = require('./fetch');
var makeExpression = require('./makeExpression');

var database = require('../database');

/*
    Fetch the URL (to get redirects and the body)
    Extract core content (from readability or otherwise).
*/
module.exports = function getExpression(url){
    
    return fetch(url).then(function(fetchedDocument){
        //console.log('Fetched', fetchedDocument);

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
                    return makeExpression(canonicalURL, fetchedDocument.html).then(function(madeExpr){
                        madeExpr.aliases = [fetchedDocument.originalURL];
                        return madeExpr;
                    });
                }
            });
        }
        else{
            return makeExpression(canonicalURL, fetchedDocument.html);
        }
    });
};
