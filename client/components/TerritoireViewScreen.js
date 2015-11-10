"use strict";

var React = require('react');

var ImmutableSet = require('immutable').Set;
var moment = require('moment');

var Tabs = React.createFactory(require('./external/Tabs.js'));
var Header = React.createFactory(require('./Header'));
var DomainTab = React.createFactory(require('./DomainTab'));
var PageListItem = React.createFactory(require('./PageListItem'));

var abstractGraphToPageGraph = require('../../common/graph/abstractGraphToPageGraph');
var pageGraphToDomainGraph = require('../../common/graph/pageGraphToDomainGraph');

var serverAPI = require('../serverAPI');

var computeSocialImpact = require('../../automatedAnnotation/computeSocialImpact');

var annotateResource = serverAPI.annotateResource;
var annotateExpressionDomain = serverAPI.annotateExpressionDomain;

/*

interface TerritoireViewScreenProps{
    user: MyWIUser,
    territoire: MyWITerritoire,
    refresh: function(){}: void
}

*/

function generateExpressionGEXF(abstractGraph, expressionById, resourceAnnotationByResourceId, expressionDomainAnnotationsByEDId){
    var pageGraph = abstractGraphToPageGraph(abstractGraph, expressionById, resourceAnnotationByResourceId, expressionDomainAnnotationsByEDId);
    
    return pageGraph.exportAsGEXF();
}


function generateDomainGEXF(abstractGraph, expressionById, resourceAnnotationByResourceId, expressionDomainAnnotationsByEDId, expressionDomainById){
    var pageGraph = abstractGraphToPageGraph(abstractGraph, expressionById, resourceAnnotationByResourceId, expressionDomainAnnotationsByEDId);
    var domainGraph = pageGraphToDomainGraph(pageGraph, expressionDomainById, expressionDomainAnnotationsByEDId);
    
    return domainGraph.exportAsGEXF();
}


function triggerDownload(content, name, type){
    var blob = new Blob([content], {type: type});
    var blobUrl = URL.createObjectURL(blob);

    var a = document.createElement('a');
    a.style.position = "absolute"; // getting off document flow
    // making an effort to hide the element
    a.style.zIndex = -1;
    a.style.opacity = 0;
    
    a.setAttribute('href', blobUrl);
    a.setAttribute('download', name);
    document.body.appendChild(a)
    a.click();
    document.body.removeChild(a);
}


function computeTerritoireTags(annotationByResourceId){
    var territoireTags = new ImmutableSet();
        
    if(annotationByResourceId){
        Object.keys(annotationByResourceId).forEach(function(rid){
            var annotations = annotationByResourceId[rid];
            var tags = annotations.tags || new Set();
            
            tags.forEach(function(t){
                territoireTags = territoireTags.add(t);
            });
        });
    }
    
    return territoireTags;
}


module.exports = React.createClass({
    displayName: 'TerritoireViewScreen',
    
    _refreshTimeout: undefined,
    _scheduleRefreshIfNecessary: function(){        
        var props = this.props;
        var self = this;
        var t = props.territoire;
        var territoireTaskCount = t && t.progressIndicators && t.progressIndicators.territoireTaskCount;
        
        console.log("scheduleRefreshIfNecessary", territoireTaskCount, t.graph && t.graph.edges.length, self._refreshTimeout);
        
        // for perceived performance purposes, sometimes only a graph with the query results is sent initially.
        // refresh the graph if no edge was found in the graph
        if( self._refreshTimeout === undefined && ((territoireTaskCount && territoireTaskCount >= 1) || (t.graph && t.graph.edges.length === 0))){
            self._refreshTimeout = setTimeout(function(){
                self._refreshTimeout = undefined;
                props.refresh();
            }, 5*1000);
        }
    },
    
    // maybe schedule a refresh on mount and when receiving props
    componentDidMount: function(){
        this._scheduleRefreshIfNecessary();
    },
    componentDidUpdate: function(){
        this._scheduleRefreshIfNecessary();
    },
    
    componentWillUnmount: function(){
        clearTimeout(this._refreshTimeout);
        this._refreshTimeout = undefined;
    },
    
    
    componentWillReceiveProps: function(nextProps) {
        var territoire = nextProps.territoire;
        
        this.setState(Object.assign({}, this.state, {
            resourceAnnotationByResourceId: territoire.resourceAnnotationByResourceId,
            expressionDomainAnnotationsByEDId: territoire.expressionDomainAnnotationsByEDId,
            territoireTags: computeTerritoireTags(territoire.resourceAnnotationByResourceId)
        }));
    },
    
    getInitialState: function() {
        var territoire = this.props.territoire;
                        
        return {
            territoireTags: computeTerritoireTags(territoire.resourceAnnotationByResourceId),
            resourceAnnotationByResourceId: territoire.resourceAnnotationByResourceId,
            expressionDomainAnnotationsByEDId: territoire.expressionDomainAnnotationsByEDId,
            territoireGraph: undefined,
            domainGraph: undefined,
            rejectedResourceIds : new ImmutableSet()
        }
    },
    
    
    render: function() {
        var self = this;
        var props = this.props;
        var state = this.state;
        var territoire = props.territoire;
        
        console.log('territoire', territoire, territoire.graph && territoire.graph.edges.length);
        
        if(territoire.graph && territoire.expressionDomainsById && state.territoireGraph !== territoire.graph){
            var domainGraph = pageGraphToDomainGraph(
                abstractGraphToPageGraph(
                    territoire.graph, 
                    territoire.expressionById, 
                    state.resourceAnnotationByResourceId,
                    state.expressionDomainAnnotationsByEDId
                ),
                territoire.expressionDomainsById,
                state.expressionDomainAnnotationsByEDId
            )
            
            // this is ugly
            setTimeout(function(){
                self.setState(Object.assign({}, state, {
                    domainGraph: domainGraph,
                    territoireGraph: territoire.graph
                }));
            }, 20)
        }
        
        
        function nodeCompare(n1, n2){
            var resourceAnnotationByResourceId = state.resourceAnnotationByResourceId;
            
            var rId1 = n1.id;
            var rId2 = n2.id;

            var rAnn1 = resourceAnnotationByResourceId[rId1];
            var rAnn2 = resourceAnnotationByResourceId[rId2];
            
            return computeSocialImpact(rAnn2) - computeSocialImpact(rAnn1);
        }
        
                
        return React.DOM.div({className: "react-wrapper"}, 
            new Header({
                 user: props.user,
                 oracleHref: "/oracles"
            }),
            
            React.DOM.main({className: 'territoire'},
                React.DOM.datalist({id: "tags"}, state.territoireTags.toArray().map(function(t){
                    return React.DOM.option({ 
                        key: t, 
                        // adding ; so that clicking on an auto-complete value does autocomplete 
                        // without the user having to hit ';' themself
                        value: t+';', 
                        label: t
                    });
                })),
                React.DOM.header({},
                    React.DOM.h1({}, 
                        "Territoire "+territoire.name
                    ),
                    territoire.progressIndicators ? React.DOM.h2({}, 
                        React.DOM.span({title: "Query oracle results"}, territoire.progressIndicators.queriesResultsCount),
                        '-',
                        React.DOM.span({title: "Crawl todo"}, territoire.progressIndicators.territoireTaskCount),
                        '- ',
                        React.DOM.span({title: "Expressions"}, Object.keys(territoire.expressionById || {}).length),
                        '+',
                        React.DOM.span(
                            {
                                title: "Edges",
                                style: {verticalAlign: 'middle', fontSize: '0.5em'}
                            }, 
                            territoire.graph.edges.length === 0 ? '(no edge)' : territoire.graph.edges.length
                        ),
                        ' ',                                   
                        React.DOM.span(
                            {
                                title: "Graph build time",
                                style: {verticalAlign: 'middle', fontSize: '0.5em'}
                            }, moment(territoire.graph.buildTime).fromNow())
                    ) : undefined
                ),
                
                React.DOM.div({className: 'tabs-and-exports'},
                    new Tabs({
                        defaultTabNum: 0,
                        tabNames: ['Pages', 'Domains'],
                        classPrefix: 'tabs-'
                    },
                        // Pages tab content
                        Object.keys(territoire.expressionById || {}).length >= 1 ? React.DOM.ul(
                            {className: 'result-list'}, 
                            territoire.graph.nodes
                                .slice() // clone array
                                .filter(function(n){
                                    return typeof n.expression_id === 'number' && 
                                        state.resourceAnnotationByResourceId[n.id];
                                })
                                .sort(nodeCompare)
                                .map(function(node){
                                    var expressionId = node.expression_id;
                                    var resourceId = node.id;
                                    if(expressionId === null || expressionId === undefined)
                                        return;

                                    var expression = territoire.expressionById[expressionId];
                                    var expressionDomainId = state.resourceAnnotationByResourceId ?
                                        state.resourceAnnotationByResourceId[resourceId].expression_domain_id :
                                        undefined;

                                    var resourceAnnotations = state.resourceAnnotationByResourceId ?
                                        state.resourceAnnotationByResourceId[resourceId] : 
                                        {tags: new Set()};
                                    var expressionDomainAnnotations = state.expressionDomainAnnotationsByEDId ?
                                        state.expressionDomainAnnotationsByEDId[expressionDomainId] : 
                                        undefined;


                                    return new PageListItem({
                                        key: resourceId,

                                        resourceId: resourceId,

                                        url: node.url,
                                        title: expression.title,
                                        excerpt: expression.excerpt,
                                        rejected: state.rejectedResourceIds.has(resourceId),

                                        resourceAnnotations: resourceAnnotations,
                                        expressionDomain : territoire.expressionDomainsById[expressionDomainId],
                                        expressionDomainAnnotations : expressionDomainAnnotations,

                                        annotate: function(newAnnotations, approved){
                                            newAnnotations = newAnnotations || {}

                                            // separate out resource annotations from expression domain annotations
                                            var deltaExpressionDomainAnnotations;
                                            var deltaResourceAnnotations;

                                            if(newAnnotations.media_type !== undefined){
                                                deltaExpressionDomainAnnotations = {
                                                    media_type: newAnnotations.media_type
                                                };
                                            }

                                            deltaResourceAnnotations = Object.assign(
                                                {}, 
                                                newAnnotations, 
                                                {approved: approved},
                                                {media_type: undefined}
                                            );

                                            // remove merged object
                                            newAnnotations = undefined;

                                            // is it worth calling annotateResource?
                                            if(Object.keys(deltaResourceAnnotations)
                                               .some(function(k){ return deltaResourceAnnotations[k] !== undefined }) ||
                                               approved !== undefined
                                              ){
                                                // TODO add a pending state or something
                                                annotateResource(resourceId, territoire.id, deltaResourceAnnotations)
                                                .catch(function(err){
                                                    console.error(
                                                        'resource annotation update error', 
                                                        resourceId, territoire.id, deltaResourceAnnotations, approved, err
                                                    );
                                                });
                                            }

                                            // is it worth calling annotateExpressionDomain?
                                            if(deltaExpressionDomainAnnotations){
                                                annotateExpressionDomain(expressionDomainId, territoire.id, deltaExpressionDomainAnnotations)
                                                .catch(function(err){
                                                    console.error(
                                                        'expression domain annotation update error', 
                                                        expressionDomainId, territoire.id, deltaExpressionDomainAnnotations, err
                                                    );
                                                });   
                                            }


                                            // updating annotations locally (optimistically hoping being in sync with the server)
                                            var territoireTags = state.territoireTags;

                                            // add tags for autocomplete
                                            // tags are only added, never removed for autocomplete purposes
                                            if(deltaResourceAnnotations.tags){
                                                deltaResourceAnnotations.tags.forEach(function(t){
                                                    territoireTags = territoireTags.add(t);
                                                });
                                            }

                                            state.resourceAnnotationByResourceId[resourceId] = Object.assign(
                                                {},
                                                resourceAnnotations,
                                                deltaResourceAnnotations
                                            );
                                            state.expressionDomainAnnotationsByEDId[expressionDomainId] = Object.assign(
                                                {},
                                                expressionDomainAnnotations,
                                                deltaExpressionDomainAnnotations
                                            );

                                            var rejectedResourceIds = state.rejectedResourceIds;
                                            if(approved !== undefined){
                                                rejectedResourceIds = approved ?
                                                    rejectedResourceIds.delete(resourceId) :
                                                    rejectedResourceIds.add(resourceId);
                                            }

                                            self.setState(Object.assign({}, state, {
                                                resourceAnnotationByResourceId: state.resourceAnnotationByResourceId, // mutated
                                                expressionDomainAnnotationsByEDId: state.expressionDomainAnnotationsByEDId, // mutated
                                                territoireTags: territoireTags,
                                                rejectedResourceIds: rejectedResourceIds
                                            }));
                                        }
                                    });
                                })
                        ) : undefined,
                        // Domains tab content
                        Object.keys(territoire.expressionById || {}).length >= 1 && state.domainGraph? 
                            new DomainTab({
                                approvedExpressionDomainIds: new Set(territoire.graph.nodes
                                    .filter(function(n){
                                        return typeof n.expression_id === 'number'
                                    })
                                    .map(function(n){
                                        return state.resourceAnnotationByResourceId[n.id].expression_domain_id;
                                    })                              
                                ),
                                expressionDomainAnnotationsByEDId: state.expressionDomainAnnotationsByEDId,
                                expressionDomainsById: territoire.expressionDomainsById,
                                domainGraph: state.domainGraph
                            }) : undefined
                    ),
                    
                    React.DOM.div({className: 'exports'},
                        React.DOM.a({
                            href: "/territoire/"+territoire.id+"/expressions.csv",
                            download: true
                        }, 'Download Pages CSV'),
                        React.DOM.a({
                            href: "/territoire/"+territoire.id+"/expressions.gexf",
                            download: territoire.name+'-pages.gexf',
                            onClick: function(e){
                                e.preventDefault();
                                
                                //console.log('before dl', territoire.resourceAnnotationByResourceId, territoire);
                                
                                triggerDownload(
                                    generateExpressionGEXF(territoire.graph, territoire.expressionById, territoire.resourceAnnotationByResourceId),
                                    territoire.name+'-pages.gexf',
                                    "application/gexf+xml"
                                );
                            }
                        }, 'Download Pages GEXF'),
                        React.DOM.a({
                            href: "/territoire/"+territoire.id+"/domains.gexf",
                            download: territoire.name+'-domains.gexf',
                            onClick: function(e){
                                e.preventDefault();
                                
                                var domainsGEXF = generateDomainGEXF(
                                    territoire.graph, 
                                    territoire.expressionById, 
                                    state.resourceAnnotationByResourceId, 
                                    state.expressionDomainAnnotationsByEDId,
                                    territoire.expressionDomainsById
                                )
                                    
                                triggerDownload(
                                    domainsGEXF,
                                    territoire.name+'-domains.gexf',
                                    "application/gexf+xml"
                                );
                            }
                        }, 'Download Domains GEXF')
                    )
                
                )
                
            )
        
        );
    }
});
