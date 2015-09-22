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
    
    database.AnnotationTasks.getAll()
        .then(function(tasks){
            console.log('There are', tasks.length, 'tasks');
        })
    
    if(inFlightTasks.size < MAX_CONCURRENT_TASKS && !databaseTasksP){
        var taskToPickCount = MAX_CONCURRENT_TASKS - inFlightTasks.size;
        
        databaseTasksP = database.AnnotationTasks.pickTasks(taskToPickCount)
            .then(function(tasks){
                //console.log('picked', tasks.length, tasks, 'tasks');
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
    
    var annotationFunction = socialSignals.get(task.type);
    //console.log('annotationFunction', annotation, annotation.type, typeof annotationFunction);

    // get the resource id + url
    return database.Resources.findValidByIds(new Set([task.resource_id]))
        .then(function(resources){
            //console.log('findValidByIds', annotation.resource_id)

            var resource = resources[0];
            if(!resource)
                return undefined; // Don't bother annotating invalid resources

            var url = resource.url;

            // save the result in the annotation

            return annotationFunction(url)
                .then(function(value){
                    //console.log('Annotation', url, task.type, value);
                    var values = {};
                    values[task.type] = value;

                    return database.ResourceAnnotations.update(
                        task.resource_id, 
                        task.territoire_id, 
                        undefined, // annotationFunction did the annotation job, so that's not a human user, so undefined
                        values, 
                        undefined // no approved value
                    );
                })
                .catch(function(err){
                    console.error('Annotation error', err, err.stack);
                });
        })
        .catch(function(err){
            console.error('processTask error', err, err.stack);
        })
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
