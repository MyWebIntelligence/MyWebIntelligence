"use strict";

var database = require('../database');
var getRelevantHeuristics = require('../expressionDomain/getRelevantHeuristic');

function findOrCreateExpressionDomainByName(expressionDomainName, url, expressionDomainHeuristic){
    return database.ExpressionDomains.findByName(expressionDomainName)
        .then(function(expressionDomain){
            return expressionDomain ? expressionDomain :
                database.ExpressionDomains.create({
                    name: expressionDomainName
                })
                .then(function(created){
                    expressionDomainHeuristic.getExpressionDomainInfos(url)
                        .then(function(expressionDomainInfos){
                            return database.ExpressionDomains.update(created[0].id, expressionDomainInfos)
                        })
                        .catch(function(err){
                            console.error('expressionDomainInfos error', err, expressionDomainName, url);
                        })
                
                    // don't wait for the expression domain infos to be in the database to return
                    
                    return created[0];
                })
                .catch(function(){
                    // race condition may have led an expression domain to being created
                    // between the first findByName and the create resulting in a violation
                    // of the unique string constraint (leading to this catch)
                    return database.ExpressionDomains.findByName(expressionDomainName)
                })
        });

}


module.exports = function findOrCreateExpressionDomain(url){
    
    var expressionDomainHeuristic = getRelevantHeuristics(url);
    
    return expressionDomainHeuristic.getExpressionDomainName(url)
        .then(function(expressionDomainName){
            return findOrCreateExpressionDomainByName(expressionDomainName, url, expressionDomainHeuristic);
        })
        // expressionDomainHeuristic.getExpressionDomainName may fail.
        // create one for this particular URL and move on
        // The user may merge pages two expression domains later
        .catch(function(){
            return findOrCreateExpressionDomainByName(url, url, expressionDomainHeuristic);
        })
};
