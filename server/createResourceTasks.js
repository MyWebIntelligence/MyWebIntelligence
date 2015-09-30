"use strict";

//var database = require('../database');



/*
    Create all the tasks related to a given resource
*/
/*
module.exports = function(resourceIds, options){
    var territoireId = options.territoireId;
    var depth = options.depth;
    
    var resourceIdsArray = resourceIds.toJSON();
    
    return Promise._allResolved([
        database.GetExpressionTasks.createTasksTodo(resourceIds, territoireId, depth)
        
        // resourceIds.toJSON().map, then socialSignalTypes.map allows to "shuffle" tasks so that 
        // different services to get data are interrogated in ~Round-Robin fashion
    ]);
};*/
