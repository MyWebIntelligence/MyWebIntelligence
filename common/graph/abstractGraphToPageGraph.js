"use strict";

var StringMap = require('stringmap');

var PageGraph = require('./PageGraph');

module.exports = function abstractGraphToPageGraph(abGraph, expressionById){
    console.time('PageGraph');
    var nodes = abGraph.nodes;
    var edges = abGraph.edges;
    
    var pageGraph = new PageGraph();

    var nextNodeName = (function(){
        var next = 0;

        return function(){
            return 'n'+(next++);
        };
    })();

    var urlToNodeName = new StringMap();

    nodes.forEach(function(expr, url){
        var expressionId = String(expr.id); // strinigfy because expressionById is a StringMap        
        var expression = Object.assign(
            {}, 
            expr,
            expressionById.get(expressionId)
        );
        
        var name = nextNodeName();

        pageGraph.addNode(name, {
            url: url,
            depth: expression.depth,
            title: expression.title || '',
            expressionId: typeof expression.id === "number" ? expression.id : -1
        });

        urlToNodeName.set(url, name);
    });

    edges.forEach(function(e){
        var source = e.source;
        var target = e.target;

        var sourceNode = pageGraph.getNode(urlToNodeName.get(source));
        var targetNode = pageGraph.getNode(urlToNodeName.get(target));

        if(sourceNode && targetNode)
            pageGraph.addEdge(sourceNode, targetNode, { weight: 1 });
    });

    console.timeEnd('PageGraph');

    return pageGraph;
};
