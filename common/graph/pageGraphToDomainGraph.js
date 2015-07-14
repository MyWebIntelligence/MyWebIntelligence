"use strict";

var expressionDomain = require('../../expressionDomain');
var DomainGraph = require('./DomainGraph');

var parse = require('url').parse;

function getHostname(url){
    return parse(url).hostname;
}
function getProtocol(url){
    return parse(url).protocol;
}

/*
    Right now, only the top1M is saved in the database
*/
var MAX_ALEXA_RANK = 1000001;

/*
    pageGraph : PageGraph
    alexaRanks: Immutable.Map<hostname, rank>
*/
module.exports = function pageGraphToDomainGraph(pageGraph, alexaRanks){
    var domainGraph = new DomainGraph();
    
    function makeDomainNodes(graph){
        
        var expressionDomainToPageNode = new Map();
        
        return Promise.all(graph.nodes.toJSON().map(function(pn){
            return expressionDomain(pn.url).then(function(ed){
                
                var expressionDomainPageNodes = expressionDomainToPageNode.get(ed);
                
                if(!expressionDomainPageNodes){
                    expressionDomainPageNodes = [];
                    expressionDomainToPageNode.set(ed, expressionDomainPageNodes);
                }
                
                expressionDomainPageNodes.push(pn);
                
            });
        }))
            .then(function(){
                var pageNodeToDomainNode = new WeakMap();
                
                expressionDomainToPageNode.forEach(function(pageNodes, ed){
                    // adding '_' at the beginning because sometimes domain names begin with numbers
                    var idyfiedExpressionDomain = '_' + ed.replace(/(\.|\-)/g, '_');
                    
                    var protocol = pageNodes.reduce(function(acc, node){
                        var p = getProtocol(node.url);
                        return p === 'http' ? acc : p;
                    }, 'http');
                    
                    var alexaRank = alexaRanks.get(getHostname(pageNodes[0].url)) || MAX_ALEXA_RANK;

                    var minFacebookLike = pageNodes.reduce(function(acc, node){
                        var fbLike = node.facebook_like;
                        return fbLike < acc && fbLike !== -1 ? fbLike : acc;
                    }, +Infinity);
                    
                    // depth is min(depth)
                    var depth = pageNodes.reduce(function(acc, node){
                        var d = node.depth;
                        return d < acc && d !== -1 ? d : acc;
                    }, +Infinity);
                    
                    var domainNode = domainGraph.addNode(idyfiedExpressionDomain, {
                        title: ed,
                        nb_expressions: pageNodes.length,
                        base_url: protocol+'://'+getHostname(pageNodes[0].url),
                        depth: depth,
                        global_alexarank: alexaRank,
                        inverse_global_alexarank: 1/alexaRank,
                        min_facebook_like: minFacebookLike
                    });
                    
                    pageNodes.forEach(function(pn){
                        pageNodeToDomainNode.set(pn, domainNode);
                    });
                })
                
                return pageNodeToDomainNode;
            });
    }
    
    
    return Promise.resolve().then(function(){
        
        return makeDomainNodes(pageGraph).then(function(pageNodeToDomainNode){
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
