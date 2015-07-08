"use strict";

var database = require('../database');
var socialSignals = require('../automatedAnnotation/socialSignals');

var socialSignalTypes = socialSignals.keySeq().toArray();

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
            console.log('Create ann', type, rid, territoireId);
            return database.Annotations.create({
                type: type,
                resource_id: rid,
                territoire_id: territoireId
            })
                .catch(function(err){
                    console.error('annotation create error', err, err.stack);
                })
                .then(function(annotationIds){
                    var aid = annotationIds[0].id;
                    console.log('Create ann task', aid);
                    return database.AnnotationTasks.createTasksTodo(aid);
                })
                .catch(function(err){
                    console.error('annotation task create error', err, err.stack);
                })
        }));
        
    })));
};
