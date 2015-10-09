"use strict";

require('../ES-mess');
process.title = "MyWI Automated Annotation worker";

var database = require('../database');
var socialSignals = require('./socialSignals');
var resourceCoreAnnotations = require('./resourceCoreAnnotations');

var taskFunctions = socialSignals.merge(resourceCoreAnnotations)


/*var errlog = function(context){
    return function(err){
        console.error(context, err);
    }
}*/

console.log('# Automated annotation process', process.pid);

var SECOND = 1000; // ms
var ONE_HOUR = 60*60*SECOND;

var TASK_PICK_INTERVAL_DELAY = 10*SECOND;
var MAX_CONCURRENT_TASKS = 40;
var AUTOMATED_ANNOTATION_MAX_DELAY = 3*60*SECOND;


var inFlightTasks = new Set();
var databaseTasksP;

function pickTasks(count){
    return database.Tasks.pickTasks(count)
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

// main interval
// pick tasks independently of tasks successes, failures and hang
setInterval(function(){
    console.log('Automated annotation interval', inFlightTasks.size);
    
    database.Tasks.getAll()
        .then(function(tasks){
            console.log('There are', tasks.length, 'tasks');
        })
    
    if(inFlightTasks.size < MAX_CONCURRENT_TASKS && !databaseTasksP){
        var taskToPickCount = MAX_CONCURRENT_TASKS - inFlightTasks.size;
        
        databaseTasksP = pickTasks(taskToPickCount);
    }
    
}, TASK_PICK_INTERVAL_DELAY);


function deleteTask(task){
    // the two .delete are purposefully not synchronized
    inFlightTasks.delete(task);
    return database.Tasks.delete(task.id)
        .then(function(){
            // if tasks were done "too quickly", let's just 
            if(inFlightTasks.size < MAX_CONCURRENT_TASKS/2 && !databaseTasksP){
                var taskToPickCount = MAX_CONCURRENT_TASKS - inFlightTasks.size;

                databaseTasksP = pickTasks(taskToPickCount);
            }
        });
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
    
    var taskFunction = taskFunctions.get(task.type);
    //console.log('taskFunction', task.type, typeof taskFunction, task);

    // get the resource id + url
    return database.Resources.findValidByIds(new Set([task.resource_id]))
        .then(function(resources){
            //console.log('findValidByIds', annotation.resource_id)

            var resource = resources[0];
            if(!resource)
                return undefined; // Don't bother annotating invalid resources

            // save the result in the annotation

            return taskFunction(resource, task.territoire_id, task.depth)
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
