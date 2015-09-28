"use strict";

var database = require('../database');

var findOrCreateExpressionDomain = require('./findOrCreateExpressionDomain');

/*
    Create a resource and an annotation for the given territoire
    
    urls: Set<url>
*/
module.exports = function createOrFindResourceForTerritoire(urls, territoireId){
    if(typeof urls === 'string')
        urls = new Set([urls]);
    
    //console.log('createOrFindResourceForTerritoire', urls.toJSON());
    
    return database.Resources.findByURLsOrCreate(urls)
        .then(function(resources){
            //console.log('resources', resources.slice(0, 5));
        
            return Promise._allResolved(resources.map(function(resource){
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
                    }
                });
                
                return Promise.all([expressionDomainP, resourceAnnotationCreatedP])
                    .then(function(res){
                        var expressionDomain = res[0];
                    
                        return database.ResourceAnnotations.update(
                            resource.id, territoireId, undefined, undefined, undefined, expressionDomain.id
                        );
                    })
                    .catch(function(err){
                        console.error('Error while database.ResourceAnnotations.update', err);
                    });
            }))
                .then(function(){
                    return resources;
                })
                .catch(function(err){
                    console.error('createOrFindResourceForTerritoire', territoireId, err, err.stack);
                })
        })
};
