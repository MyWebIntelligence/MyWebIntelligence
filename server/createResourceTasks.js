"use strict";

var database = require('../database');
var socialSignals = require('../automatedAnnotation/socialSignals');

var socialSignalTypes = Object.keys(socialSignals);


/*
    Create all the tasks related to a given resource
*/
module.exports = function(resourceIds, options){
    var territoireId = options.territoireId;
    var depth = options.depth;
    
    return Promise._allResolved([
        database.GetExpressionTasks.createTasksTodo(resourceIds, territoireId, depth)
    ].concat(socialSignalTypes.map(function(type){
        return database.AnnotationTasks.createTasksTodo(resourceIds, type, territoireId);
    })));
};
