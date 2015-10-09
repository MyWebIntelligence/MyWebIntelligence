"use strict";

var database = require('../../database');

var findOrCreateExpressionDomain = require('../../server/findOrCreateExpressionDomain');

/*
    Create all the things that go along creating a resource.
    This function mostly for the consumption of createOrFindResourceForTerritoire and addAlias
    
    This function returns a Promise that should always resolve
*/

module.exports = function(resource, territoireId, depth){
    //console.log('prepareResourceForTerritoire', territoireId, depth, resource.url)
    
    var expressionDomainP = findOrCreateExpressionDomain(resource.url)
        .catch(function(err){
            console.error('findOrCreateExpressionDomain error', err);
            throw err;
        });

    var resourceAnnotationCreatedP = database.ResourceAnnotations.create({
        resource_id: resource.id,
        territoire_id: territoireId
    }).catch(function(err){
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
            console.error('ResourceAnnotations.create error', err);
            throw err;
        }
    });

    return Promise.all([expressionDomainP, resourceAnnotationCreatedP])
        .then(function(res){
            var expressionDomain = res[0];

            return database.ResourceAnnotations.update(
                resource.id, territoireId, undefined, undefined, undefined, expressionDomain.id
            );
        })
        .then(function(){
            // for now, only get expression of query results
            if(depth === 0)
                return database.Tasks.createTasksTodo(resource.id, territoireId, 'expression', depth);
        })
        .catch(function(err){
            console.error('Error while database.ResourceAnnotations.update', err);
        });
    
}
