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
    
    return database.Resources.findByURLsOrCreate(urls)
        .then(function(resources){
            //console.log('resources', resources.slice(0, 5));
        
            return Promise._allResolved(resources.map(function(resource){
                var expressionDomainP = findOrCreateExpressionDomain(resource.url);
                var resourceAnnotationCreatedP = database.ResourceAnnotations.create({
                    resource_id: resource.id,
                    territoire_id: territoireId
                });
                
                return Promise.all([expressionDomainP, resourceAnnotationCreatedP])
                    .then(function(res){
                        var expressionDomain = res[0];
                    
                        return database.ResourceAnnotations.update(
                            resource.id, territoireId, undefined, undefined, undefined, expressionDomain.id
                        );
                    })
                    .catch(function(err){
                        console.error('Error while findOrCreateExpressionDomain, database.ResourceAnnotations.create or database.ResourceAnnotations.update', err);
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
