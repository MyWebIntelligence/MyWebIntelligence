"use strict";

var database = require('../../database');

var analyzeExpression = require('./analyzeExpression');


module.exports = function(resource, territoireId){
    if(typeof resource.expression_id !== "number")
        return Promise.reject(new Error('Resource '+resource.id+' has no expression'))
    
    return database.Expressions.getExpressionsWithContent(new Set([resource.expression_id]))
    .then(function(expressions){
        var expression = expressions[0];
        
        return analyzeExpression(expression, resource.id, territoireId);
    })
    .catch(function(err){
        console.error('Catch all', err, err.stack);
        
    })
    
    
};
