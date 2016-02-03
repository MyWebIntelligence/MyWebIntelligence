"use strict";

var database = require('../database');

var prepareResourceForTerritoire = require('../automatedAnnotation/resourceCoreAnnotations/prepareResourceForTerritoire');
var prepareExpressionDomainForTerritoire = require('../automatedAnnotation/resourceCoreAnnotations/prepareExpressionDomainForTerritoire');
var onQueryCreated = require('./onQueryCreated');


/*
    This function is used to import a territoire after an export.
    Any change should be made with backward-compatibility in mind (people who exported a territoire
    a long time ago should still be able to re-import it)
*/

module.exports = function(territoireData, user){
    console.log('createTerritoire', territoireData, user.id);
    
    var territoireOwnData = {
        name: territoireData.name,
        description: territoireData.description,
        user_id: user.id
    };
    
    var queriesData = territoireData.queries || [];
    var resources = territoireData.resources || [];
    var expressionDomains = territoireData.expressionDomains || [];
    
    return database.Territoires.create(territoireOwnData)
    .then(function(territoires){
        var t = territoires[0];
        var territoireId = t.id;
        
        /*
            Create the queries
        */
        var queriesReadyP = Promise._allResolved(queriesData.map(function(queryData){
            return (queryData.oracle_id ? 
                database.Oracles.findById(queryData.oracle_id) : // creation from UI
                database.Oracles.findByOracleNodeModuleName(queryData.oracle_node_module_name)) // creation from import
            .then(function(oracle){
                if(!oracle)
                    throw new Error('No oracle found '+ queryData.oracle_id+ ' ' +queryData.oracle_node_module_name);
                
                queryData.oracle_id = oracle.id;
                delete queryData.oracle_node_module_name;
                
                queryData.territoire_id = territoireId;
                
                return queryData;
            })
            .then(database.Queries.create)
            .then(function(queries){
                var query = queries[0];
                return onQueryCreated(query, user)
                .then(function(){
                    return query;
                });
            })
            .catch(function(err){
                console.error('Error trying to create a query', queryData, err);
            });
            
        }));
        
        var resourcesReadyP = Promise._allResolved(resources.map(function(r){
            var annotations = r.annotations;
            
            return database.Resources.findByURLOrCreate(r.url)
            .then(function(resource){
                return prepareResourceForTerritoire(resource, territoireId, 0)
                .then(function(){
                    return database.ResourceAnnotations.update(resource.id, territoireId, user.id, annotations)
                });
            })
        }));
        
        var expressionDomainReadyP = Promise._allResolved(expressionDomains.map(function(ed){
            var annotations = ed.annotations;
            
            return database.ExpressionDomains.findOrCreateByName(ed.name)
            .then(function(expressionDomain){
                return prepareExpressionDomainForTerritoire(expressionDomain, territoireId)
                .then(function(){
                    return database.ExpressionDomainAnnotations.update(expressionDomain.id, territoireId, user.id, annotations)
                });
            })
        }));
        
        return Promise.all([queriesReadyP, resourcesReadyP, expressionDomainReadyP]).then(function(res){
            var queries = res[0];
            t.queries = queries;
            return t;
        });
    });
}
