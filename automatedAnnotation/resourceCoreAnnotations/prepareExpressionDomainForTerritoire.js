"use strict";

var database = require('../../database');

var estimatePotentialAudience = require('../estimatePotentialAudience');


/*
    Create all the things that go along creating an expression domain.
    This function mostly for the consumption of prepareResourceForTerritoire
    
    This function returns a Promise that should always resolve
*/
module.exports = function(expressionDomain, territoireId){ 
    var expressionDomainAnnotationCreatedP = database.ExpressionDomainAnnotations.create({
        expression_domain_id: expressionDomain.id,
        territoire_id: territoireId
    })
    .catch(function(err){
        if(err && err.constraint === "expression_domain_annotations_pkey"){
            // This (attempt to recreate annotations for the same (expression domain, territoire) pair)
            // may happen and we can't know beforehand unless a cache of the database 
            // resource_annotations table is kept (which is impractical for memory reasons)
            // or if we check beforehands (but results in 2 queries each time instead of one)
            // Ignore silently, it's an expected error
            return; 
        }
        else{
            // forward any other error
            console.error('ExpressionDomainsAnnotations.create error', err);
            throw err;
        }
    });
        

    return expressionDomainAnnotationCreatedP
    .then(function(){
        return estimatePotentialAudience(expressionDomain)
        .then(function(potentialAudience){
            if(typeof potentialAudience === 'number'){
                return database.ExpressionDomainAnnotations.update(
                    expressionDomain.id, territoireId, null, {
                        estimated_potential_audience: potentialAudience
                    }
                );
            }

        })
        
    });
    
}
