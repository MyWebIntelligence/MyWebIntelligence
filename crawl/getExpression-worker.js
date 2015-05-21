"use strict";

require('../ES-mess');
process.title = "MyWI getExpression worker";

var getExpression = require('./getExpression');
var approve = require('./approve');

var database = require('../database');
var isValidResource = require('./isValidResource');

var errlog = function(context){
    return function(err){
        console.error(context, err);
    }
}

console.log('# getExpression process', process.pid);

var SECOND = 1000; // ms
var ONE_HOUR = 60*60*SECOND;

var TASK_PICK_INTERVAL_DELAY = 10*SECOND;
var MAX_CONCURRENT_TASKS = 25;
var GET_EXPRESSION_MAX_DELAY = 2*60*SECOND;


var inFlightTasks = new Set();

// main interval
// pick tasks independently of tasks successes, failures and hang
setInterval(function(){
    console.log('interval', inFlightTasks.size);
    
    if(inFlightTasks.size < MAX_CONCURRENT_TASKS){
        var taskToPickCount = MAX_CONCURRENT_TASKS - inFlightTasks.size;
        
        database.GetExpressionTasks.pickTasks(taskToPickCount)
            .then(function(tasks){
                tasks.forEach(processTask);
            })
            .catch(function(err){
                console.error('pickTasks error', err);
            });
    }
    
}, TASK_PICK_INTERVAL_DELAY);


function deleteTask(task){
    // the two actions are purposefully not synchronized
    inFlightTasks.delete(task);
    return database.GetExpressionTasks.delete(task.id);
}



function processTask(task){
    inFlightTasks.add(task);
    
    // getExpression fights against a timer
    (new Promise(function(resolve){
        setTimeout(resolve, GET_EXPRESSION_MAX_DELAY);
    })).then(function(){
        return deleteTask(task);
    });
    
    
    database.Resources.findValidByIds(new Set([task.resource_id]))
        .then(function(resources){
            var resource = resources[0];
            var url = resource.url;

            // there is already a "complete" resource, do nothing.
            if(typeof resource.http_status === 'number' || resource.other_error !== null)
                return;

            return getExpression(url)
                .then(function(resExprLink){
                    //console.log('resExprLink', resExprLink);

                    var resourceIdP = resExprLink.resource.url !== url ?
                        database.Resources.addAlias(task.resource_id, resExprLink.resource.url).catch(errlog("addAlias")) :
                        Promise.resolve(task.resource_id);

                    return resourceIdP.then(function(resourceId){                        
                        var resourceUpdatedP = database.Resources.update(resourceId, resExprLink.resource).catch(errlog("Resources.update"));
                        var expressionUpdatedP;
                        var linksUpdatedP;
                        var tasksCreatedP;

                        if(isValidResource(resExprLink.resource)){                            
                            expressionUpdatedP = database.Expressions.create(resExprLink.expression)
                                .then(function(expressions){
                                    var expression = expressions[0];
                                    return database.Resources.associateWithExpression(resourceId, expression.id);
                                }).catch(errlog("Expressions.create + associateWithExpression"));
                            
                            linksUpdatedP = resExprLink.links.size >= 1 ? 
                                database.Resources.findByURLsOrCreate(resExprLink.links)
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

                                //throw 'TODO filter out references that already have a corresponding expression either as uri or alias';

                                // Don't recreate tasks for now. Will re-enable when a better approval algorithm is implemented.
                                tasksCreatedP = Promise.resolve()/*database.GetExpressionTasks.createTasksTodo(
                                    new Set(expression.references),
                                    task.related_territoire_id,
                                    task.depth+1
                                );*/
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
