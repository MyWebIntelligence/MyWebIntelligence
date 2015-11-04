"use strict";

var database = require('../../database');

var getExpression = require('../../crawl/getExpression');
var approve = require('../../crawl/approve');

var isValidResource = require('../../crawl/isValidResource');

var addAlias = require('../../server/addAlias');

var approveResource = require('../../server/approveResource');

function errlog(context){
    return function(err){
        console.error(context, err);
    }
}

module.exports = function(resource, territoireId, depth){
    var taskResourceId = resource.id;
    var url = resource.url;
    
    return getExpression(url)
        .then(function(resExprLink){
            //console.log('resExprLink', resExprLink);

            var resourceIdP = resExprLink.resource.url !== url ?
                addAlias(taskResourceId, resExprLink.resource.url, territoireId, depth).catch(errlog("addAlias")) :
                Promise.resolve(taskResourceId);

            return resourceIdP.then(function(resourceId){
                var resourceUpdatedP = database.Resources.update(
                    resourceId,
                    Object.assign(
                        {},
                        {other_error: null}, // remove any previous other_error if there was one
                        resExprLink.resource // take the other_error from here if there is one
                    )
                )
                    .catch(errlog("Resources.update"));
                var expressionUpdatedP;
                var linksUpdatedP;
                var tasksCreatedP;

                if(isValidResource(resExprLink.resource)){                            
                    expressionUpdatedP = database.Expressions.create(resExprLink.expression)
                        .then(function(expressions){
                            var expression = expressions[0];
                            return database.Resources.associateWithExpression(resourceId, expression.id);
                        }).catch(errlog("Expressions.create + associateWithExpression"));


                    expressionUpdatedP
                    .then(function(){
                        return database.Tasks.createTasksTodo(resourceId, territoireId, 'analyze_expression', depth);
                    })
                    .catch(function(err){
                        console.error('Error while trying to create analyze_expression tasks', err, err.stack);
                    })

                    linksUpdatedP = resExprLink.links.size >= 1 ? 
                        database.Resources.findByURLsOrCreate(resExprLink.links)
                            .then(function(linkResources){
                                return Promise._allResolved(linkResources.map(function(r){
                                    return database.Tasks.createTasksTodo(r.id, territoireId, 'prepare_resource', depth+1);
                                })).then(function(){ return linkResources; })
                            })
                            .then(function(linkResources){
                                var linksData = linkResources.map(function(r){
                                    return {
                                        source: resourceId,
                                        target: r.id
                                    };
                                });

                                return database.Links.create(linksData).catch(errlog("Links.create"));
                            }).catch(errlog("Resources.findByURLsOrCreate link"))
                        : undefined;

                    if(approve({depth: depth, expression: resExprLink.expression})){
                        approveResource(resourceId, territoireId, depth);
                    }
                }

                return Promise.all([resourceUpdatedP, expressionUpdatedP, linksUpdatedP, tasksCreatedP]);
            });
        })
        .catch(function(err){
            console.log('getExpression error', url, err, err.stack);

            return; // symbolic. Just to make explicit the next .then is a "finally"
        })
}
