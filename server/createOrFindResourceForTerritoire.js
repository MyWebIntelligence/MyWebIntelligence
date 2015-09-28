"use strict";

var database = require('../database');

var createResourceAddendum = require('./createResourceAddendum');

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
        
            return Promise._allResolved(resources.map(function(r){
                return createResourceAddendum(r, territoireId);
            }))
                .then(function(){
                    return resources;
                })
                .catch(function(err){
                    console.error('createOrFindResourceForTerritoire', territoireId, err, err.stack);
                })
        })
};
