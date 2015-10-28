"use strict";

var database = require('../../database');

var findOrCreateExpressionDomain = require('../../server/findOrCreateExpressionDomain');
var estimatePotentialAudience = require('../estimatePotentialAudience');


/*
    Create all the things that go along creating an expression domain.
    This function mostly for the consumption of prepareResourceForTerritoire
    
    This function returns a Promise that should always resolve
*/
module.exports = function(url, territoireId){ 
    console.log('prepareExpressionDomainForTerritoire', url, territoireId)

    var expressionDomainP = findOrCreateExpressionDomain(url);
    
    var expressionDomainAnnotationCreatedP = expressionDomainP
    .then(function(ed){
        return database.ExpressionDomainAnnotations.create({
            expression_domain_id: ed.id,
            territoire_id: territoireId
        })
        .catch(function(err){
            if(err && err.constraint === "resource_annotations_pkey"){
                // This (attempt to recreate annotations for the same resource/territoire pair)
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
    });
        

    return Promise.all([expressionDomainP, expressionDomainAnnotationCreatedP])
        .then(function(res){
            var expressionDomain = res[0];
            
            return estimatePotentialAudience(expressionDomain)
            .then(function(potentialAudience){
                if(typeof potentialAudience === 'number'){
                    console.log('potentialAudience', expressionDomain.name, potentialAudience)
                    return database.ExpressionDomainAnnotations.update(
                        expressionDomain.id, territoireId, undefined, {
                            estimated_potential_audience: potentialAudience
                        }
                    );
                }
                
            })
            .then(function(){
                return expressionDomain;
            })
        });
    
}
