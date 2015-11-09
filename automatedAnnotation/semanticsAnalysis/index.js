"use strict";

var database = require('../../database');

var analyzeExpression = require('./analyzeExpression');
var findMostImportantWords = require('./findMostImportantWords');

module.exports = function(resource, territoireId){
    //console.log('analyze_expression task', resource, territoireId);
    
    if(typeof resource.expression_id !== "number")
        return Promise.reject(new Error('Resource '+resource.id+' has no expression'))
    
    return database.Expressions.getExpressionsWithContent(new Set([resource.expression_id]))
    .then(function(expressions){
        var expression = expressions[0];
        
        return analyzeExpression(expression, resource.id, territoireId);
    })
    .then(function(termFreqByField){
        //console.log('termFreqByField', termFreqByField)
        return findMostImportantWords(termFreqByField).slice(0, 12);
    })
    .then(function(scoredWords){
        //console.log('scoredWords', scoredWords);
        return database.ResourceAnnotations.addTags(resource.id, territoireId, new Set(scoredWords.map(function(sw){
            return sw.word;
        })));
    })
    .catch(function(err){
        console.error('Catch all', err, err.stack);
    });
    
};
