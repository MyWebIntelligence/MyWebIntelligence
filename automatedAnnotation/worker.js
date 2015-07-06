"use strict";

require('../ES-mess');
process.title = "MyWI Automated Annotation worker";

var database = require('../database');

/*var errlog = function(context){
    return function(err){
        console.error(context, err);
    }
}*/

console.log('# Automated annotation process', process.pid);

var SECOND = 1000; // ms
var ONE_HOUR = 60*60*SECOND;

var TASK_PICK_INTERVAL_DELAY = 10*SECOND;
var MAX_CONCURRENT_TASKS = 30;
var AUTOMATED_ANNOTATION_MAX_DELAY = 3*60*SECOND;


var inFlightTasks = new Set();
var databaseTasksP;

// main interval
// pick tasks independently of tasks successes, failures and hang
setInterval(function(){
    console.log('Automated annotation interval', inFlightTasks.size);
    
    if(inFlightTasks.size < MAX_CONCURRENT_TASKS && !databaseTasksP){
        var taskToPickCount = MAX_CONCURRENT_TASKS - inFlightTasks.size;
        
        databaseTasksP = database.AutomatedAnnotationTasks.pickTasks(taskToPickCount)
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
    return database.AutomatedAnnotationTasks.delete(task.id);
}



function processTask(task){
    //var taskTimeout;
    
    inFlightTasks.add(task);
    
    // getExpression fights against a timer
    (new Promise(function(resolve){
        /*taskTimeout =*/ setTimeout(resolve, AUTOMATED_ANNOTATION_MAX_DELAY);
    })).then(function(){
        /*var resourceId = task.resource_id;
        database.Resources.update(
            resourceId,
            {other_error: RESOURCE_OTHER_ERRORS.TIMEOUT}
        )*/
        return deleteTask(task);
    });
    
    
    /*database.Resources.findValidByIds(new Set([task.resource_id]))
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
                        database.Resources.addAlias(task.resource_id, resExprLink.resource.url).catch(errlog("addAlias")) :
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
                                tasksCreatedP = Promise.resolve()
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
        });*/
    
}



process.on('uncaughtException', function(e){
    console.error('# uncaughtException automated annotation', process.pid, Date.now() % ONE_HOUR, e, e.stack);
    process.exit();
});

process.on('SIGINT', function(){
    console.log('SIGINT', process.pid);
    process.exit();
});
