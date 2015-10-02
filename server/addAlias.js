"use strict";

var database = require('../database');

// database.Resources.addAlias(task.resource_id, resExprLink.resource.url).catch(errlog("addAlias"))

var prepareResourceForTerritoire = require('../automatedAnnotation/resourceCoreAnnotations/prepareResourceForTerritoire');

/*
    returns Promise<ResourceId> for the target ResourceId (to later associate an expression if necessary)
*/
module.exports = function(fromResourceId, toURL, territoireId, depth){

    return database.Resources.findByURLOrCreate(toURL)
        .then(function(toRes){
            // This creates the resource addendum for the alias target.
            // This means the addendum on the target were mostly useless.
            // It is an acceptable loss as it's very likely aliases are rare
            return prepareResourceForTerritoire(toRes, territoireId, depth)
                .then(function(){
                    return database.Resources.alias(fromResourceId, toRes.id)
                })
                .then(function(){
                    return toRes.id;
                });
        })
    
}
