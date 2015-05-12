"use strict";

var StringMap = require('stringmap');

/*
    graph is an abstract page graph
*/
// an indirection to avoid a circular dependency with database/index.js
module.exports = function(Expressions){
    
    return function(graph){
        var expressionsById = new StringMap/*<id, expression>*/();
        var ids = new Set();

        graph.nodes.forEach(function(node){
            var id = node.id;
            if(id !== undefined)
                ids.add(id);
        });

        return ids.size > 0 ? Expressions.getExpressionsWithContent(ids).then(function(expressions){
            expressions.forEach(function(completeExpression){
                expressionsById.set(String(completeExpression.id), completeExpression);
            });

            return expressionsById;
        }) : expressionsById;
    };
};
