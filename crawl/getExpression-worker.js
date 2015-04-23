"use strict";

require('../ES-mess');
process.title = "MyWI getExpression worker";

var getExpression = require('./getExpression');

var database = require('../database');

console.log('# getExpression process', process.pid);

var ONE_HOUR = 60*60*1000;

var RETRY_DELAY = 10*1000;// ms


function pickATask(){
    console.log('pickATask!', process.pid);
    
    database.GetExpressionTasks.pickATask()
        .then(function(task){
            if(task){
                console.log('found task', process.pid, task);
                var url = task.uri;

                return getExpression(url)
                    .then(function(expression){
                        return database.Expressions.create(expression);
                    })
                    .catch(function(err){
                        console.log('getExpression error', url, err, err.stack);

                        return; // symbolic. Just to make explicit the next .then is a "finally"
                    })
                    // in any case "finally"
                    .then(function(){
                        database.GetExpressionTasks.delete(task.id);
                        pickATask();
                    });     
            }
            else{
                console.log('no task', process.pid, 'retrying after', (RETRY_DELAY/1000).toFixed(1), 's');
                setTimeout(pickATask, RETRY_DELAY);
            }
        })
        .catch(function(err){
            console.error('pick a task error', err);
        });
    
}

// startup
pickATask();


process.on('uncaughtException', function(e){
    console.error('# uncaughtException getExpression', process.pid, Date.now() % ONE_HOUR, e, e.stack);
    process.exit();
});

process.on('SIGINT', function(){
    console.log('SIGINT', process.pid);
    process.exit();
});
