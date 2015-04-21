"use strict";

require('../ES-mess');
process.title = "MyWI getExpression worker";

var getExpression = require('./getExpression');

var database = require('../database');

console.log('# getExpression process', process.pid);

var ONE_HOUR = 60*60*1000;

var RETRY_DELAY = 10*1000;// ms


(function pickATask(){
    database.GetExpressionTask.pickATask()
        .then(function(task){
            if(task){
                var url = task.uri;

                return getExpression(url)
                    .then(function(expression){
                        database.Expressions.create(expression);
                    })
                    .catch(function(err){
                        console.log('getExpression error', url, err, err.stack);

                        return; // symbolic. Just to make explicit the next .then is a "finally"
                    })
                    // in any case "finally"
                    .then(function(){
                        database.GetExpressionTask.delete(task.id);
                        pickATask();
                    });     
            }
            else{
                setTimeout(pickATask, RETRY_DELAY)
            }
        });
    
})();


process.on('uncaughtException', function(e){
    console.error('# uncaughtException getExpression', process.pid, Date.now() % ONE_HOUR, e, e.stack);
    process.exit();
});

process.on('SIGINT', function(){
    console.log('SIGINT', process.pid);
    process.exit();
});
