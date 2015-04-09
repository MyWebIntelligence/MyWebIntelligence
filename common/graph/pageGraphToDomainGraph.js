"use strict";

var expressionDomain = require('../../expressionDomain');
var DomainGraph = require('./DomainGraph');

module.exports = function pageGraphToDomainGraph(pageGraph){
    var domainGraph = new DomainGraph();
    
    var pageNodeToDomainNode = new WeakMap();
    
    function getCorrespondingDomainNode(pn){
        return expressionDomain(pn.url).then(function(ed){
            // adding '_' at the beginning because sometimes domain names begin with numbers
            var idyfiedExpressionDomain = '_' + ed.replace(/(\.|\-)/g, '_');
            
            var domainNode = domainGraph.getNode(idyfiedExpressionDomain);
            
            if(!domainNode){
                domainNode = domainGraph.addNode(idyfiedExpressionDomain, {
                    title: ed,
                    nb_expressions: 0
                });
            }
            
            domainNode.nb_expressions++;
            pageNodeToDomainNode.set(pn, domainNode);
        });
    }
    
    return Promise.resolve().then(function(){
        
        var domainNodePs = pageGraph.nodes.toJSON().map(function(n){
            return getCorrespondingDomainNode(n);
        });
        
        return Promise.all(domainNodePs).then(function(){
            var sourceToTargetToCount = new Map();
            
            pageGraph.edges.forEach(function(e){
                var domainSource = pageNodeToDomainNode.get(e.node1);
                var domainTarget = pageNodeToDomainNode.get(e.node2);
                
                if(!domainSource)
                    throw 'no domainSource';
                if(!domainTarget)
                    throw 'no domainTarget';
                
                if(domainSource === domainTarget)
                    return; // self-reference, no need to create an edge
                
                var targetToCount = sourceToTargetToCount.get(domainSource);
                if(!targetToCount){
                    targetToCount = new Map();
                    sourceToTargetToCount.set(domainSource, targetToCount);
                }
                
                var count = targetToCount.get(domainTarget) || 0;
                targetToCount.set(domainTarget, count+1);
            });
                
            sourceToTargetToCount.forEach(function(targetToCount, source){
                targetToCount.forEach(function(count, target){
                    domainGraph.addEdge(source, target, {
                        weight: count
                    });
                });
            });
            
            return domainGraph;    
        });
        
    });
};
