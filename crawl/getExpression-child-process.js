"use strict";

require('../ES-mess');

var getExpression = require('./getExpression');

process.title = "MyWI getExpression worker";

console.log('process on!', process.pid);

process.on('message', function(url){
    
    getExpression(url)
        .then(function(expression){
            process.send({
                url: url,
                expression: expression
            });
        })
        .catch(function(err){
            process.send({
                url: url,
                error: String(err)
            });
        });
    
});
