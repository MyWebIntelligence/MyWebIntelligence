"use strict";

require('../ES-mess');
process.title = "MyWI Automated Annotation worker";

var database = require('../database');
var socialSignals = require('./socialSignals');


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
        
        databaseTasksP = database.AnnotationTasks.pickTasks(taskToPickCount)
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
    return database.AnnotationTasks.delete(task.id);
}



function processTask(task){
    var taskTimeout;
    
    inFlightTasks.add(task);
    
    // getExpression fights against a timer
    (new Promise(function(resolve){
        taskTimeout = setTimeout(resolve, AUTOMATED_ANNOTATION_MAX_DELAY);
    })).then(function(){
        /*var resourceId = task.resource_id;
        database.Resources.update(
            resourceId,
            {other_error: RESOURCE_OTHER_ERRORS.TIMEOUT}
        )*/
        return deleteTask(task);
    });
    
    
    database.Annotations.findById(task.annotation_id)
        .then(function(annotation){
            // pick the correct function for the task type
            var annotationFunction = socialSignals.get(task.type);
            
            // get the resource id + url
            return database.Resources.findValidByIds(new Set([task.resource_id]))
                .then(function(resources){
                    var resource = resources[0];
                    var url = resource.url;
                    
                    // save the result in the annotation
                
                    return annotationFunction(url)
                        .then(function(value){
                            return database.Annotations.update(annotation.id, {
                                value: value
                            });
                        });
                
                
                
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
    console.error('# uncaughtException automated annotation', process.pid, Date.now() % ONE_HOUR, e, e.stack);
    process.exit();
});

process.on('SIGINT', function(){
    console.log('SIGINT', process.pid);
    process.exit();
});
