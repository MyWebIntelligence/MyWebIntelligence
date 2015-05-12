"use strict";

require('../ES-mess');
process.title = "MyWI getExpression worker";

var getExpression = require('./getExpression');
var database = require('../database');

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
        
    var url = task.uri;
    
    var expressionP = getExpression(url);
    // getExpression fights against a timer
    var timerP = new Promise(function(resolve){
        setTimeout(resolve, GET_EXPRESSION_MAX_DELAY);
    });
    
    expressionP
        .then(function(expression){
            return database.Expressions.create(expression);
        })
        .catch(function(err){
            console.log('getExpression error', url, err, err.stack);

            return; // symbolic. Just to make explicit the next .then is a "finally"
        })
        // in any case ("finally")
        .then(function(){
            return deleteTask(task);
        });
    
    timerP.then(function(){
        return deleteTask(task);
    })
}



process.on('uncaughtException', function(e){
    console.error('# uncaughtException getExpression', process.pid, Date.now() % ONE_HOUR, e, e.stack);
    process.exit();
});

process.on('SIGINT', function(){
    console.log('SIGINT', process.pid);
    process.exit();
});
