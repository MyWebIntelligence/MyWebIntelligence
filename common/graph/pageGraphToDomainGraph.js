"use strict";

var stats = require('simple-statistics');
var moment = require('moment');

var DomainGraph = require('./DomainGraph');
var computeSocialImpact = require('../../automatedAnnotation/computeSocialImpact');


function cleanValue(v, forbidden, replacement){
    if(!Array.isArray(forbidden))
        forbidden = [forbidden];
    
    // won't work if NaN € forbidden
    return forbidden.includes(v) ? replacement : v;
}


var DEFAULT_POTENTIAL_AUDIENCE = 100;

/*
    pageGraph : PageGraph
    expressionDomainsById
    expressionDomainAnnotationsByEDId
*/
module.exports = function pageGraphToDomainGraph(pageGraph, expressionDomainsById, expressionDomainAnnotationsByEDId){
    var domainGraph = new DomainGraph();
    
    //throw new Error("Add logic that computes the domain edge lifetime from the page edges lifetime (of all the edges (p1 -> p2) from d1 to d2, the start date is the min of all the p1's publication dates");
    
    function makeDomainNodes(graph){
        
        var expressionDomainIdToPageNode = new Map();
        
        graph.nodes.forEach(function(pn){
            var expressionDomainId = pn.expression_domain_id;
                                    
            var expressionDomainPageNodes = expressionDomainIdToPageNode.get(expressionDomainId);
            
            if(!expressionDomainPageNodes){
                expressionDomainPageNodes = [];
                expressionDomainIdToPageNode.set(expressionDomainId, expressionDomainPageNodes);
            }
            
            expressionDomainPageNodes.push(pn);
        });
        
        var expressionDomainDataMap = new Map();
        
        expressionDomainIdToPageNode.forEach(function(pageNodes, expressionDomainId){
            var expressionDomain = expressionDomainsById[expressionDomainId];
            
            // Currently, the graph is built unrelated to the territoire
            // this leads to resources being part of the graph while not being approved (because they were part 
            // of a previous territoire for instance. Noticed via depth===2 which is currently 
            // (Sept 2015, no crawl) impossible) and maybe not even having been through prepareResourceForTerritoire
            // This leads to expressionDomainId === undefined and expressionDomain === undefined
            // This test prevents problems under these circumstances
            if(expressionDomain){
                var expressionNodes = pageNodes.filter(function(n){ return n.expressionId !== -1 });

                var edAnnotations = expressionDomainAnnotationsByEDId[expressionDomainId];

                var potentialAudience = edAnnotations.estimated_potential_audience || DEFAULT_POTENTIAL_AUDIENCE;

                var domainFbLikes = expressionNodes
                    .map(function(node){ return node.facebook_like; })
                    .filter(function(likes){ return likes !== undefined && likes !== null && likes !== -1; });

                var domainFbShares = expressionNodes
                    .map(function(node){ return node.facebook_share; })
                    .filter(function(shares){ return shares !== undefined && shares !== null && shares !== -1; });

                var domainLinkedinShares = expressionNodes
                    .map(function(node){ return node.linkedin_share; })
                    .filter(function(shares){ return shares !== undefined && shares !== null && shares !== -1; });

                var domainGooglePagerank = expressionNodes
                    .map(function(node){ return node.google_pagerank; })
                    .filter(function(gRank){ return gRank !== undefined && gRank !== null; });

                var socialImpacts = expressionNodes
                    .map(function(node){ return computeSocialImpact(node); })
                    .filter(function(si){ return si !== undefined && si !== null && si !== 0; });

                var socialImpact = cleanValue(stats.sum(socialImpacts), [undefined, null], 0)

                // depth is min(depth)
                var depth = expressionNodes.reduce(function(acc, node){
                    var d = node.depth;
                    return d < acc && d !== -1 ? d : acc;
                }, +Infinity);

                var publicationDates = expressionNodes
                    .map(function(node){ return node.publication_date })
                    .filter(function(date){ return !!date })
                    .map(function(date){return moment(date)});

                var urls = expressionNodes.map(function(n){
                    return n.url;
                });
                
                urls.toString = function(){
                    return this.join(' | ');
                };
                
                expressionDomainDataMap.set(expressionDomain.id, {
                    expression_domain_id: expressionDomain.id,
                    base_url: expressionDomain.main_url || expressionDomain.name,
                    urls: urls,
                    depth: depth,

                    domain_title: expressionDomain.title || expressionDomain.name,
                    media_type: edAnnotations.media_type || '',
                    emitter_type: edAnnotations.emitter_type || '',
                    
                    title: expressionDomain.name,
                    description: expressionDomain.description || '',
                    keywords: (expressionDomain.keywords || []).join(' / '),
                    nb_expressions: expressionNodes.length,

                    min_facebook_like: cleanValue(stats.min(domainFbLikes), [undefined, null], -1),
                    max_facebook_like: cleanValue(stats.max(domainFbLikes), [undefined, null], -1),
                    median_facebook_like: cleanValue(stats.median(domainFbLikes), [undefined, null], -1),

                    min_facebook_share: cleanValue(stats.min(domainFbShares), [undefined, null], -1),
                    max_facebook_share: cleanValue(stats.max(domainFbShares), [undefined, null], -1),
                    median_facebook_share: cleanValue(stats.median(domainFbShares), [undefined, null], -1),

                    min_linkedin_share: cleanValue(stats.min(domainLinkedinShares), [undefined, null], -1),
                    max_linkedin_share: cleanValue(stats.max(domainLinkedinShares), [undefined, null], -1),
                    median_linkedin_share: cleanValue(stats.median(domainLinkedinShares), [undefined, null], -1),

                    min_google_pagerank: cleanValue(stats.min(domainGooglePagerank), [undefined, null], -1),
                    max_google_pagerank: cleanValue(stats.max(domainGooglePagerank), [undefined, null], -1),
                    median_google_pagerank: cleanValue(stats.median(domainGooglePagerank), [undefined, null], -1),

                    sum_likes: cleanValue(stats.sum(domainFbLikes), [undefined, null], 0),
                    sum_shares: (
                        cleanValue(stats.sum(domainFbShares), [undefined, null], 0) +
                        cleanValue(stats.sum(domainLinkedinShares), [undefined, null], 0)
                    ),

                    estimated_potential_audience: potentialAudience,
                    
                    min_publication_date: publicationDates.length >= 1 ? 
                        moment.min.apply(moment, publicationDates).format('YYYY-MM-DD') : 
                        '',
                    social_impact: socialImpact
                })
            }
            
        })
        
        // make estimated_potential_audience_index and social_impact_index
        var estimatedPotentialAudiences = [];
        var socialImpacts = [];
        
        expressionDomainDataMap.forEach(function(data){
            estimatedPotentialAudiences.push(data.estimated_potential_audience);
            socialImpacts.push(data.social_impact);
        });
        
        var minEstimatedPotentialAudience = Math.min.apply(undefined, estimatedPotentialAudiences);
        var maxEstimatedPotentialAudience = Math.max.apply(undefined, estimatedPotentialAudiences);
        var estimatedPotentialAudienceRange = maxEstimatedPotentialAudience - minEstimatedPotentialAudience;
        
        var minSocialImpact = Math.min.apply(undefined, socialImpacts);
        var maxSocialImpact = Math.max.apply(undefined, socialImpacts);
        var socialImpactRange = maxSocialImpact - minSocialImpact;
        
        expressionDomainDataMap.forEach(function(data){
            data.social_impact_index = Math.ceil( 100*(data.social_impact - minSocialImpact)/socialImpactRange );
            delete data.social_impact; // because it's completely useless on its own
            
            data.estimated_potential_audience_index = Math.ceil( 
                100*(data.estimated_potential_audience - minEstimatedPotentialAudience)
                /estimatedPotentialAudienceRange 
            );
        });
        
        
        var pageNodeToDomainNode = new WeakMap();
        
        expressionDomainIdToPageNode.forEach(function(pageNodes, expressionDomainId){
            var expressionDomain = expressionDomainsById[expressionDomainId];
            
            if(expressionDomain){
                var domainData = expressionDomainDataMap.get(expressionDomainId);
                
                var lifetime = domainData.min_publication_date ? 
                    {start: domainData.min_publication_date} : 
                    undefined;
                
                var domainNode = domainGraph.addNode(expressionDomain.name, domainData, lifetime);
                
                pageNodes.forEach(function(pn){
                    pageNodeToDomainNode.set(pn, domainNode);
                });  
            }
                                                     
                                                
        });
            

        return pageNodeToDomainNode;
    }
    
            
    var pageNodeToDomainNode = makeDomainNodes(pageGraph);
    var sourceToTargetToEdgeData = new Map();

    pageGraph.edges.forEach(function(e){
        var domainSource = pageNodeToDomainNode.get(e.node1);
        var domainTarget = pageNodeToDomainNode.get(e.node2);

        // related to the expressionDomain === undefined problem above.
        // It leads to having no domain node for some page nodes making these tests fail.
        // disabling them for now
        /*if(!domainSource)
            throw 'no domainSource';
        if(!domainTarget)
            throw 'no domainTarget';*/
        if(domainSource === undefined || domainTarget === undefined)
            return;

        if(domainSource === domainTarget)
            return; // self-reference, no need to create an edge

        var targetToEdgeData = sourceToTargetToEdgeData.get(domainSource);
        if(!targetToEdgeData){
            targetToEdgeData = new Map();
            sourceToTargetToEdgeData.set(domainSource, targetToEdgeData);
        }

        var edgeData = targetToEdgeData.get(domainTarget) || {count: 0, start: undefined};
        var sourceMinPublicationDate = domainSource.min_publication_date;
        
        if(!edgeData.start){
            edgeData.start = moment(sourceMinPublicationDate);
        }
        else{
            if(sourceMinPublicationDate){
                edgeData.start = moment.min(
                    moment(sourceMinPublicationDate),
                    edgeData.start
                );
            }
        }
            
        edgeData.count++;
        
        targetToEdgeData.set(domainTarget, edgeData);
    });

    sourceToTargetToEdgeData.forEach(function(targetToEdgeData, source){
        targetToEdgeData.forEach(function(edgeData, target){
            var lifetime;
            
            if(edgeData.start){
                lifetime = {
                    start: edgeData.start.format('YYYY-MM-DD')
                }
            }
            
            domainGraph.addEdge(source, target, {
                weight: edgeData.count
            }, lifetime);
        });
    });

    return domainGraph;    
};
