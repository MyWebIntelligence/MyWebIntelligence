"use strict";

var stats = require('simple-statistics');

var immutableMap = require('immutable').Map;

var expressionDomain = require('../../expressionDomain');
var DomainGraph = require('./DomainGraph');


var parse = require('url').parse;

function getHostname(url){
    return parse(url).hostname;
}
function getProtocol(url){
    return parse(url).protocol;
}

function cleanValue(v, forbidden, replacement){
    if(!Array.isArray(forbidden))
        forbidden = [forbidden];
    
    // won't work if NaN € forbidden
    return forbidden.includes(v) ? replacement : v;
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
    alexaRanks = alexaRanks || immutableMap(); // eventually, alexaRanks will just be annotation. See #160
    
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
                    var protocol = pageNodes.reduce(function(acc, node){
                        var p = getProtocol(node.url);
                        return p === 'http' ? acc : p;
                    }, 'http');
                    
                    var alexaRank = alexaRanks.get(getHostname(pageNodes[0].url)) || MAX_ALEXA_RANK;

                    var domainFbLikes = pageNodes
                        .map(function(node){ return node.facebook_like; })
                        .filter(function(likes){ return likes !== undefined && likes !== null && likes !== -1; });
                    
                    var domainFbShares = pageNodes
                        .map(function(node){ return node.facebook_share; })
                        .filter(function(shares){ return shares !== undefined && shares !== null && shares !== -1; });
                    
                    var domainTwitterShares = pageNodes
                        .map(function(node){ return node.twitter_share; })
                        .filter(function(shares){ return shares !== undefined && shares !== null && shares !== -1; });
                    
                    var domainLinkedinShares = pageNodes
                        .map(function(node){ return node.linkedin_share; })
                        .filter(function(shares){ return shares !== undefined && shares !== null && shares !== -1; });
                    
                    var domainGooglePagerank = pageNodes
                        .map(function(node){ return node.google_pagerank; })
                        .filter(function(gRank){ return gRank !== undefined && gRank !== null && gRank !== 12; });
                    
                    
                    // depth is min(depth)
                    var depth = pageNodes.reduce(function(acc, node){
                        var d = node.depth;
                        return d < acc && d !== -1 ? d : acc;
                    }, +Infinity);
                    
                    var domainNode = domainGraph.addNode(ed, {
                        title: ed,
                        nb_expressions: pageNodes.length,
                        base_url: protocol+'://'+getHostname(pageNodes[0].url),
                        depth: depth,
                        
                        global_alexarank: alexaRank,
                        inverse_global_alexarank: 1/alexaRank,
                        
                        min_facebook_like: cleanValue(stats.min(domainFbLikes), [undefined, null], -1),
                        max_facebook_like: cleanValue(stats.max(domainFbLikes), [undefined, null], -1),
                        median_facebook_like: cleanValue(stats.median(domainFbLikes), [undefined, null], -1),
                        
                        min_facebook_share: cleanValue(stats.min(domainFbShares), [undefined, null], -1),
                        max_facebook_share: cleanValue(stats.max(domainFbShares), [undefined, null], -1),
                        median_facebook_share: cleanValue(stats.median(domainFbShares), [undefined, null], -1),
                        
                        min_twitter_share: cleanValue(stats.min(domainTwitterShares), [undefined, null], -1),
                        max_twitter_share: cleanValue(stats.max(domainTwitterShares), [undefined, null], -1),
                        median_twitter_share: cleanValue(stats.median(domainTwitterShares), [undefined, null], -1),
                        
                        min_linkedin_share: cleanValue(stats.min(domainLinkedinShares), [undefined, null], -1),
                        max_linkedin_share: cleanValue(stats.max(domainLinkedinShares), [undefined, null], -1),
                        median_linkedin_share: cleanValue(stats.median(domainLinkedinShares), [undefined, null], -1),
                        
                        min_google_pagerank: cleanValue(stats.min(domainGooglePagerank), [undefined, null], 12),
                        max_google_pagerank: cleanValue(stats.max(domainGooglePagerank), [undefined, null], 12),
                        median_google_pagerank: cleanValue(stats.median(domainGooglePagerank), [undefined, null], 12)
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
            
            //console.log("sourceToTargetToCount", sourceToTargetToCount.size);
            
            sourceToTargetToCount.forEach(function(targetToCount, source){
                //console.log("targetToCount", source, targetToCount.size);
                
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
