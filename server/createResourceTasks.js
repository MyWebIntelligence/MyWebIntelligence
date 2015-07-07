"use strict";

var database = require('../database');
var socialSignals = require('../automatedAnnotation/socialSignals');

var socialSignalTypes = socialSignals.keys().toArray();


/*
    Create all the tasks related to a given resource
*/
module.exports = function(resourceIds, options){
    var territoireId = options.territoireId;
    var depth = options.depth;
    
    return Promise._allResolved([
        database.GetExpressionTasks.createTasksTodo(resourceIds, territoireId, depth)
    ].concat(socialSignalTypes.map(function(type){
        return Promise._allResolved(resourceIds.toJSON().map(function(rid){
            return database.Annotations.create({
                type: type,
                resource_id: rid,
                territoire_id: territoireId
            })
                .then(function(aid){
                    return database.AnnotationTasks.createTasksTodo(aid);

                })
        }));
        
    })));
};
