"use strict";

require('../ES-mess');
process.title = "MyWI getExpression worker";

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

var SECOND = 1000; // ms
var ONE_HOUR = 60*60*SECOND;

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

            return getExpression(url)
                .then(function(resExprLink){
                    //console.log('resExprLink', resExprLink);

                    var resourceIdP = resExprLink.resource.url !== url ?
                        addAlias(task.resource_id, resExprLink.resource.url, territoireId, task.depth).catch(errlog("addAlias")) :
                        Promise.resolve(task.resource_id);

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
                            
                            
                            //console.log('task.territoire_id', task.territoire_id)
                            
                            /*
                                Promise._allResolved(resources.map(function(r){
                                    return database.Tasks.createTasksTodo(r.id, query.belongs_to, 'prepare_resource', depth);
                                }))
                            */
                            
                            linksUpdatedP = resExprLink.links.size >= 1 ? 
                                database.Resources.findByURLsOrCreate(resExprLink.links)
                                    .then(function(linkResources){
                                        return Promise._allResolved(linkResources.map(function(r){
                                            return database.Tasks.createTasksTodo(r.id, territoireId, 'prepare_resource', task.depth+1);
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

                            if(approve({depth: task.depth, expression: resExprLink.expression})){
                                approveResource(resourceId, task.territoire_id, task.depth);
                            }
                        }

                        return Promise.all([resourceUpdatedP, expressionUpdatedP, linksUpdatedP, tasksCreatedP]);
                    });
                })
                .catch(function(err){
                    console.log('getExpression error', url, err, err.stack);

                    return; // symbolic. Just to make explicit the next .then is a "finally"
                })
        })
        .catch(function(){})
        // in any case ("finally")
        .then(function(){
            clearTimeout(taskTimeout);
            return deleteTask(task);
        });
    
}



process.on('uncaughtException', function(e){
    console.error('# uncaughtException getExpression', process.pid, Date.now() % ONE_HOUR, e, e.stack);
    process.exit();
});

process.on('SIGINT', function(){
    console.log('SIGINT', process.pid);
    process.exit();
});
