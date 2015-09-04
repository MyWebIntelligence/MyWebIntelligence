"use strict";

var StringMap = require('stringmap');

var PageGraph = require('./PageGraph');


/*
    expressionById : StringMap<ExpressionId, Expression>
    annotationsById : DictObject<ResourceId, DictObj<AnnotationType, value>>
*/
module.exports = function abstractGraphToPageGraph(abGraph, expressionById, annotationsById){
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

    nodes.forEach(function(res){
        var expressionId = String(res.expression_id); // strinigfy because expressionById is a StringMap
        var resourceId = res.id;
        
        var expression = Object.assign(
            {}, 
            res,
            expressionById[expressionId]
        );
        
        var annotations = annotationsById[resourceId];
        
        var name = nextNodeName();
        
        pageGraph.addNode(name, Object.assign(
            {
                url: res.url,
                depth: expression.depth,
                title: expression.title || '',
                expressionId: typeof expression.id === "number" ? expression.id : -1
            }, 
            annotations,
            annotations ? {
                tags: annotations.tags.toJSON().join(', ')
            } : undefined
        ));

        var urlToNodeNameKey = String(res.id);
        //console.log(urlToNodeNameKey);
        
        urlToNodeName.set(urlToNodeNameKey, name);
    });
    
    edges.forEach(function(e){
        var sourceIdStr = String(e.source);
        var targetIdStr = String(e.target);

        var sourceNode = pageGraph.getNode(urlToNodeName.get(sourceIdStr));
        var targetNode = pageGraph.getNode(urlToNodeName.get(targetIdStr));

        if(sourceNode && targetNode){
            pageGraph.addEdge(sourceNode, targetNode, { weight: 1 });
        }
    });
    
    console.timeEnd('PageGraph');

    return pageGraph;
};
