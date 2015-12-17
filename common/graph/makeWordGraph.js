"use strict";

var WordGraph = require('./WordGraph');

module.exports = function makeWordGraph(resources, expressionById, resourceAnnotationByResourceId){
    console.log('makeWordMap', resources, expressionById, resourceAnnotationByResourceId)
    
    var nodeData = new Map();
    var edgeData = new Map();

    var nextNodeName = (function(){
        var next = 0;

        return function(){
            return 'n'+(next++);
        };
    })();
    
    Object.keys(resourceAnnotationByResourceId).forEach(function(resourceId){
        var annotations = resourceAnnotationByResourceId[resourceId];
        var tags = annotations.tags;
        
        tags.forEach(function(t){
            var data = nodeData.get(t);
            
            if(!data){
                data = {
                    word: t,
                    doc_count: 0
                }
            }
            
            data.doc_count++;
            
            nodeData.set(t, data);
        })
        
        var sortedTags = tags.toJSON().sort(); // default lexicographic sort is used on purpose
        
        sortedTags.forEach(function(t1, i){
            var t1Edges = edgeData.get(t1);
            
            if(!t1Edges){
                t1Edges = new Map();
            }
            
            sortedTags.slice(i+1).forEach(function(t2){
                var data = t1Edges.get(t2);
                
                if(!data){
                    data = {
                        weight: 0
                    }
                }
                
                data.weight++;
                
                t1Edges.set(t2, data);
            });
            
            edgeData.set(t1, t1Edges);
        });
        
    });
    
    
    var wg = new WordGraph();
    var wordToNodeName = new Map();
    
    nodeData.forEach(function(data, word){
        var name = nextNodeName();

        wg.addNode(name, data);
        wordToNodeName.set(word, name);
    });
    
    edgeData.forEach(function(w1Edges, w1){
        w1Edges.forEach(function(data, w2){
            var sourceNode = wg.getNode(wordToNodeName.get(w1));
            var targetNode = wg.getNode(wordToNodeName.get(w2));

            if(sourceNode && targetNode){
                wg.addEdge(sourceNode, targetNode, data);
            }
        })
    })
    
    return wg;
}
