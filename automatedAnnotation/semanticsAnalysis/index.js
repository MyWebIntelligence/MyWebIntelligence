"use strict";

var database = require('../../database');

var client = require('./elasticsearch/client');
var es = require('./elasticsearch');

var makeIndexName = require('./makeIndexName');
var makeIndexSettings = require('./makeIndexSettings');
var findExpressionLanguage = require('./findExpressionLanguage');

var ELASTICSEARCH_ANALYSIS_HOST = "elasticanalysis:9200";
var MYWI_EXPRESSION_DOCUMENT_TYPE = require('./MYWI_EXPRESSION_DOCUMENT_TYPE');

var esapiP = client(ELASTICSEARCH_ANALYSIS_HOST).then(es);

module.exports = function(resource, territoireId){
    if(typeof resource.expression_id !== "number")
        return Promise.reject(new Error('Resource '+resource.id+' has no expression'))
    
    return database.Expressions.getExpressionsWithContent(new Set([resource.expression_id]))
    .then(function(expressions){
        var expression = expressions[0];
        var expressionLanguage = findExpressionLanguage(expression);
        
        console.log('expressionLanguage', expressionLanguage);
        
        var indexName = makeIndexName(territoireId, expressionLanguage);
        
        return esapiP
        .then(function(esapi){
            return esapi.createIndex(indexName, makeIndexSettings(expressionLanguage))
            .catch(function(err){
                console.error('createIndex error', err);
            })
            .then(function(){
                return esapi.indexDocument(indexName, MYWI_EXPRESSION_DOCUMENT_TYPE, expression, String(resource.id))
            })
            
            
        })
    })
    .catch(function(err){
        console.error('Catch all', err, err.stack);
        
    })
    
    
};
