"use strict";

require('../ES-mess');
process.title = "MyWI Task worker";

var database = require('../database');
var socialSignals = require('./socialSignals');
var resourceCoreAnnotations = require('./resourceCoreAnnotations');

var taskFunctions = socialSignals.merge(resourceCoreAnnotations)

console.log('# Task worker process', process.pid);

var SECOND = 1000; // ms
var ONE_HOUR = 60*60*SECOND;

var TASK_PICK_INTERVAL_DELAY = 15*SECOND;
var MAX_CONCURRENT_TASKS = 40;
var AUTOMATED_ANNOTATION_MAX_DELAY = 3*60*SECOND;

var processName = '# TW'+process.pid;
var processedTasks = 0;
var inFlightTasks = new Set();

var databaseTasksP;

function pickTasks(count){
    return database.Tasks.pickTasks(count)
        .then(function(tasks){
            //console.log('picked', tasks.length, tasks, 'tasks');
            tasks.forEach(function(task){
                inFlightTasks.add(task);
                processTask(task);
            });
            databaseTasksP = undefined;
        })
        .catch(function(err){
            console.error(processName, 'pickTasks error', err);
            databaseTasksP = undefined;
        });
}

// main interval
// pick tasks independently of tasks successes, failures and hang
var taskPickTimeout = setTimeout(function taskPickTimeoutFunction(){
    // reschedule now so it's sure it's done
    // (doing it at the end exposes the risk of an uncaught thrown error preventing rescheduling)
    taskPickTimeout = setTimeout(taskPickTimeoutFunction, TASK_PICK_INTERVAL_DELAY)
    
    console.log(processName, 'Task timeout', inFlightTasks.size);
    
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
                .then(function(){ processedTasks++ })
                .catch(function(err){
                    console.error(processName, 'Annotation error', err, err.stack);
                });
        })
        .catch(function(err){
            console.error(processName, 'processTask error', err, err.stack);
        })
        // in any case ("finally")
        .then(function(){
            clearTimeout(taskTimeout);
            return deleteTask(task);
        });

}


/*
    "The end times are here, ok?
    Jesus is about to come back or maybe the Buddha or maybe Godzilla is about to come back.
    But someone's coming back and they're not gonna be happy".
    https://vimeo.com/135347162
    
    Let's deal with when the time of this process ends.
    When this process is about to die for any reason, it will attempt its best to:
    * abort all remaining tasks
*/
function lastBreathe(){
    console.log(
        processName, 'dying with honor.\n',
        'Processed', processedTasks, 'tasks ('+ String(inFlightTasks.size), 'pending)'
    )
    
    // stop picking tasks
    clearTimeout(taskPickTimeout);
    
    // abort all current tasks
    var pendingTasks = inFlightTasks;
    inFlightTasks = undefined; // this will make inFlightTasks.add() in pickTasks fail. It's on purpose.
    
    // Best effort to put the database back in a reasonable state. No biggie if failing to do so.
    return Promise.race([
        database.Tasks.setTodoState(pendingTasks),
        new Promise(function(resolve) { setTimeout(resolve, 20*SECOND) })
    ]);
    
}


process.on('uncaughtException', function(e){
    console.error('# uncaughtException automated annotation', process.pid, Date.now() % ONE_HOUR, e, e.stack);
});

process.once('SIGINT', function(){
    console.log('SIGINT', process.pid);
    lastBreathe()
    .then(function(){ process.exit(); })
    .catch(function(){ process.exit(); });
});

process.once('SIGTERM', function(){
    console.log('SIGTERM', process.pid);
    lastBreathe()
    .then(function(){ process.exit(); })
    .catch(function(){ process.exit(); });
});
