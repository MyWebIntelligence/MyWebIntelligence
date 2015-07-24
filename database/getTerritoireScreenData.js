"use strict";

var database = require('../database/index.js');

var getGraphExpressions = require('../common/graph/getGraphExpressions');

var getTerritoireResourceGraph = require('../server/getTerritoireResourceGraph');
var simplifyExpression = require('../server/simplifyExpression');



module.exports = function getTerritoireScreenData(territoireId){
    console.log('getTerritoireScreenData', territoireId);

    var territoireP = database.Territoires.findById(territoireId);
    var relevantQueriesP = database.Queries.findByBelongsTo(territoireId);

    var queryReadyP = relevantQueriesP.then(function(queries){
        return Promise.all(queries.map(function(q){
            return database.QueryResults.findLatestByQueryId(q.id).then(function(queryResults){
                q.oracleResults = queryResults && queryResults.results;
            });
        }));
    });

    var abstractPageGraphP = getTerritoireResourceGraph(territoireId)
        .then(function(res){
            return res.graph;
        });

    var expressionByIdP = abstractPageGraphP
        .then(getGraphExpressions)
        .then(function(expressionById){
            console.time('simplifyExpression');
            Object.keys(expressionById).forEach(function(id){
                expressionById[id] = simplifyExpression(expressionById[id]);
            });
            console.timeEnd('simplifyExpression');
            return expressionById;
        });

    var annotationByResourceIdP = abstractPageGraphP
        .then(function(graph){
            console.time('fetching annotations');
            return database.complexQueries.getGraphAnnotations(graph, territoireId);
        });
    annotationByResourceIdP.then(console.timeEnd.bind(console, 'fetching annotations'))

    // timing of this query will make the values certainly out-of-sync with when 
    var progressIndicatorsP = database.complexQueries.getProgressIndicators(territoireId);

    console.time('getProgressIndicators');
    progressIndicatorsP.then(console.timeEnd.bind(console, 'getProgressIndicators'))

    console.time('all data');
    return Promise.all([
        territoireP, relevantQueriesP, abstractPageGraphP, progressIndicatorsP, expressionByIdP, annotationByResourceIdP, queryReadyP
    ]).then(function(res){
        console.timeEnd('all data');
        var territoire = res[0];

        territoire.queries = res[1];
        territoire.graph = res[2];
        territoire.progressIndicators = res[3];
        territoire.expressionById = res[4];
        territoire.annotationByResourceId = res[5];

        return territoire;
    });
};
