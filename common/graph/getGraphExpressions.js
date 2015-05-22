"use strict";

/*
    graph is an abstract page graph
*/
// an indirection to avoid a circular dependency with database/index.js
module.exports = function(Expressions){
    
    return function(graph){
        var expressionsById = Object.create(null);
        var ids = new Set();

        graph.nodes.forEach(function(node){
            var id = node.expression_id;
            if(id !== null)
                ids.add(id);
        });

        return ids.size > 0 ? Expressions.getExpressionsWithContent(ids).then(function(expressions){
            expressions.forEach(function(completeExpression){
                expressionsById[String(completeExpression.id)] = completeExpression;
            });

            return expressionsById;
        }) : expressionsById;
    };
};
