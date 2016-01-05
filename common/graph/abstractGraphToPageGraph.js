"use strict";

var StringMap = require('stringmap');
var moment = require('moment');

var PageGraph = require('./PageGraph');


/*
    expressionById : StringMap<ExpressionId, Expression>
    annotationsById : DictObject<ResourceId, DictObj<AnnotationType, value>>
*/
module.exports = function abstractGraphToPageGraph(abGraph, expressionById, resourceAnnotationsById, expressionDomainAnnotationsById){
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
        var expressionId = res.expression_id;
        var resourceId = res.id;
        
        var expression = Object.assign(
            {}, 
            res,
            expressionById[expressionId]
        );
        
        var resourceAnnotations = resourceAnnotationsById ? resourceAnnotationsById[resourceId] : undefined;
                
        // Sometimes, prepareResourceForTerritoire isn't done yet and 
        // the ResourceAnnotation is created while there is no expression domain yet.
        // as a consequence, resourceAnnotationsById does not have the resource id as key
        // Skip these resources
        if(resourceAnnotations){
            var expressionDomainId = resourceAnnotations.expression_domain_id;

            var expressionDomainAnnotations = expressionDomainAnnotationsById[expressionDomainId];

            var name = nextNodeName();

            var publicationDate = typeof resourceAnnotations.publication_date === 'string' ?
                resourceAnnotations.publication_date : undefined;
            
            var lifetime = publicationDate ? {start: moment(publicationDate).format('YYYY-MM-DD')} : undefined;
            
            pageGraph.addNode(name, Object.assign(
                {
                    url: res.url,
                    depth: expression.depth,
                    title: expression.title || '',
                    expressionId: typeof expressionId === "string" ? expressionId : ''
                }, 
                resourceAnnotations,
                {
                    media_type: expressionDomainAnnotations.media_type || '',
                    tags: resourceAnnotations.tags.toJSON().join(', '),
                    sentiment: resourceAnnotations.sentiment || undefined,
                    favorite: typeof resourceAnnotations.favorite === 'boolean' ? resourceAnnotations.favorite : undefined,
                    publication_date: publicationDate ? moment(publicationDate).format('YYYY-MM-DD') : '',
                    
                    created_at: undefined,
                    updated_at: undefined,
                    user_id: undefined,
                    approved: undefined
                }
            ), lifetime);

            var urlToNodeNameKey = res.id;
            //console.log(urlToNodeNameKey);

            urlToNodeName.set(urlToNodeNameKey, name);
        }
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
    
    console.log('pageGraph', pageGraph.nodes.size);
    
    console.timeEnd('PageGraph');

    return pageGraph;
};
