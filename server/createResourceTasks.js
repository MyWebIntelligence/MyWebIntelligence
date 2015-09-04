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
    
    var resourceIdsArray = resourceIds.toJSON();
    
    return Promise._allResolved([
        database.GetExpressionTasks.createTasksTodo(resourceIds, territoireId, depth)
        
        // resourceIds.toJSON().map, then socialSignalTypes.map allows to "shuffle" tasks so that 
        // different services to get data are interrogated in ~Round-Robin fashion
    ].concat(resourceIdsArray.map(function(rid){
        return Promise.all(socialSignalTypes.map(function(type){
            return new Promise(function(resolve, reject){
                // Need to put space between same annotation types tasks (to prevent IP ban by services)
                // Need to put space between resources because updates are race-y and lose information
                // Schedule annotation task for later, so the task is performed later in hope that it will
                // prevent race conditions when updating the annotation.
                // Race conditions can happen for automated annotations (which isn't a big deal 
                // since it's cheap to redo them)
                // Race conditions can also happen in collision with human annotations which is a BIG deal 
                // but unlikely enough to be considered acceptable for now.
                setTimeout(function(){
                    database.AnnotationTasks.createTasksTodo(rid, territoireId, type)
                        .then(resolve)
                        .catch(function(err){
                            console.error('annotation create error', err, err.stack);
                            reject(err)
                        });  
                }, Math.round(Math.random() * resourceIdsArray.length * socialSignalTypes.length));
            })
        }));
    })));
};
