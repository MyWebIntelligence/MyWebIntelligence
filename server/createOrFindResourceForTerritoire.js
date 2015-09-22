"use strict";

var database = require('../database');

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
                return database.ResourceAnnotations.create({
                    resource_id: resource.id,
                    territoire_id: territoireId
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
