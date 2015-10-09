"use strict";

require('../ES-mess');
process.title = "MyWI getExpression worker";

var SECOND = 1000; // ms
var ONE_HOUR = 60*60*SECOND;


/*
var getExpression = require('./getExpression');
var approve = require('./approve');

var database = require('../database');
var isValidResource = require('./isValidResource');

var addAlias = require('../server/addAlias');

var approveResource = require('../server/approveResource');


var errlog = function(context){
    return function(err){
        console.error(context, err);
    }
}

console.log('# getExpression process', process.pid);


var TASK_PICK_INTERVAL_DELAY = 10*SECOND;
var MAX_CONCURRENT_TASKS = 30;
var GET_EXPRESSION_MAX_DELAY = 3*60*SECOND;

var RESOURCE_OTHER_ERRORS = Object.freeze({
    TIMEOUT: "timeout"
});


var inFlightTasks = new Set();
var databaseTasksP;

// main interval
// pick tasks independently of tasks successes, failures and hang
setInterval(function(){
    
    console.log('getExpression interval', inFlightTasks.size);
    
    if(inFlightTasks.size < MAX_CONCURRENT_TASKS && !databaseTasksP){
        
        var taskToPickCount = MAX_CONCURRENT_TASKS - inFlightTasks.size;
        
        databaseTasksP = database.GetExpressionTasks.pickTasks(taskToPickCount)
            .then(function(tasks){
                tasks.forEach(processTask);
                databaseTasksP = undefined;
            })
            .catch(function(err){
                console.error('pickTasks error', err);
                databaseTasksP = undefined;
            });
    }
    
}, TASK_PICK_INTERVAL_DELAY);


function deleteTask(task){
    // the two actions are purposefully not synchronized
    inFlightTasks.delete(task);
    return database.GetExpressionTasks.delete(task.id);
}



function processTask(task){
    var taskTimeout;
    
    var territoireId = task.territoire_id;
    
    inFlightTasks.add(task);
    
    // getExpression fights against a timer
    (new Promise(function(resolve){
        taskTimeout = setTimeout(resolve, GET_EXPRESSION_MAX_DELAY);
    })).then(function(){
        var resourceId = task.resource_id;
        database.Resources.update(
            resourceId,
            {other_error: RESOURCE_OTHER_ERRORS.TIMEOUT}
        )
        return deleteTask(task);
    });
    
    
    database.Resources.findValidByIds(new Set([task.resource_id]))
        .then(function(resources){
            var resource = resources[0];
            var url = resource.url;

            // there is already a "complete" resource, do nothing.
            if(resource.expression_id !== null || resource.other_error !== null)
                return;

            
        })
        .catch(function(){})
        // in any case ("finally")
        .then(function(){
            clearTimeout(taskTimeout);
            return deleteTask(task);
        });
    
}
*/


process.on('uncaughtException', function(e){
    console.error('# uncaughtException getExpression', process.pid, Date.now() % ONE_HOUR, e, e.stack);
    process.exit();
});

process.on('SIGINT', function(){
    console.log('SIGINT', process.pid);
    process.exit();
});
