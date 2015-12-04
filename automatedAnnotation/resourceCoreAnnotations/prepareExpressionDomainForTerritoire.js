"use strict";

var database = require('../../database');

var estimatePotentialAudience = require('../estimatePotentialAudience');

function findMostFrequentValue(allExpressionDomainAnnotations, field){
    var fieldValueOccurences = Object.create(null);

    allExpressionDomainAnnotations.forEach(function(ann){
        if(!ann[field]) // covers null, undefined and empty string
            return
        
        if(!(ann[field] in fieldValueOccurences))
            fieldValueOccurences[ann[field]] = 0;

        fieldValueOccurences[ann[field]]++
    });

    var mostFrequentFieldValue;

    Object.keys(fieldValueOccurences).forEach(function(fieldValue){
        if(!mostFrequentFieldValue || fieldValueOccurences[fieldValue] > fieldValueOccurences[mostFrequentFieldValue])
            mostFrequentFieldValue = fieldValue;
    });

    return mostFrequentFieldValue;
}


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
        var estimatedAudienceP = estimatePotentialAudience(expressionDomain)
        var allExpressionDomainAnnotationsP = database.ExpressionDomainAnnotations.findByExpressionDomainId(expressionDomain.id)
        
        Promise.all([estimatedAudienceP, allExpressionDomainAnnotationsP])
        .then(function(res){
            var potentialAudience = res[0];
            var allExpressionDomainAnnotations = res[1];
            
            var delta = Object.create(null);
            
            // media_type
            var mostFrequentMediaType = findMostFrequentValue(allExpressionDomainAnnotations, 'media_type')
    
            if(mostFrequentMediaType)
                delta['media_type'] = mostFrequentMediaType;
            
            // emitter_type
            var mostFrequentEmitterType = findMostFrequentValue(allExpressionDomainAnnotations, 'emitter_type')
    
            if(mostFrequentEmitterType)
                delta['emitter_type'] = mostFrequentEmitterType;
            
            
            // estimated_potential_audience
            if(typeof potentialAudience === 'number'){
                delta.estimated_potential_audience = potentialAudience;
            }
            
            console.log('prepareExpressionDomainForTerritoire', allExpressionDomainAnnotations, delta)
            
            return database.ExpressionDomainAnnotations.update(
                expressionDomain.id, territoireId, null, delta
            );

        })
        
    });
    
}
