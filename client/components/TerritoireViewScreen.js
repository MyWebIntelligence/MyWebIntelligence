"use strict";

var React = require('react');

var ImmutableSet = require('immutable').Set;
var moment = require('moment');

var Tabs = React.createFactory(require('./external/Tabs.js'));
var Header = React.createFactory(require('./Header'));
var DomainsTab = React.createFactory(require('./DomainsTab'));
var PagesTab = React.createFactory(require('./PagesTab'));

var abstractGraphToPageGraph = require('../../common/graph/abstractGraphToPageGraph');
var pageGraphToDomainGraph = require('../../common/graph/pageGraphToDomainGraph');
var makeWordGraph = require('../../common/graph/makeWordGraph');

var serverAPI = require('../serverAPI');

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
    // Territoire data refresh
    _scheduleRefreshIfNecessary: function(){        
        var props = this.props;
        var self = this;
        var t = props.territoire;
        var territoireTaskCount = t && t.progressIndicators && t.progressIndicators.territoireTaskCount;
                
        // for perceived performance purposes, sometimes only a graph with the query results is sent initially.
        // refresh the graph if no edge was found in the graph
        if( self._refreshTimeout === undefined && ((territoireTaskCount && territoireTaskCount >= 1) || (t.graph && t.graph.edges.length === 0))){
            self._refreshTimeout = setTimeout(function(){
                self._refreshTimeout = undefined;
                props.refresh();
            }, 5*1000);
        }
    },

    componentDidMount: function(){
        this._scheduleRefreshIfNecessary();
    },
    
    componentWillReceiveProps: function(nextProps) {
        var state = this.state;
        var territoire = nextProps.territoire;
        
        var resourceAnnotationByResourceId = territoire.resourceAnnotationByResourceId || state.resourceAnnotationByResourceId;
        var expressionDomainAnnotationsByEDId = territoire.expressionDomainAnnotationsByEDId || state.expressionDomainAnnotationsByEDId;
        

        
        var deltaState = {
            resourceAnnotationByResourceId: resourceAnnotationByResourceId,
            expressionDomainAnnotationsByEDId: expressionDomainAnnotationsByEDId,
            territoireTags: state.resourceAnnotationByResourceId !== nextProps.territoire.resourceAnnotationByResourceId ?
                computeTerritoireTags(resourceAnnotationByResourceId) :
                state.territoireTags,
            
            territoireGraph: territoire && territoire.graph
        };
        
        if(territoire.graph && state.territoireGraph !== territoire.graph){
            if(resourceAnnotationByResourceId){
                deltaState.approvedExpressionDomainIds = new Set(territoire.graph.nodes
                    .filter(function(n){
                        return n.expression_id&& resourceAnnotationByResourceId[n.id]
                    })
                    .map(function(n){
                        return resourceAnnotationByResourceId[n.id].expression_domain_id;
                    })                              
                )   
            }
            
            if(expressionDomainAnnotationsByEDId && resourceAnnotationByResourceId){
                deltaState.domainGraph = pageGraphToDomainGraph(
                    abstractGraphToPageGraph(
                        territoire.graph, 
                        territoire.expressionById, 
                        resourceAnnotationByResourceId,
                        expressionDomainAnnotationsByEDId
                    ),
                    territoire.expressionDomainsById,
                    expressionDomainAnnotationsByEDId
                );
            }
        }
        
        this.setState(Object.assign({}, this.state, deltaState));
    },
    
    getInitialState: function() {
        var territoire = this.props.territoire;
                        
        return {
            territoireTags: computeTerritoireTags(territoire.resourceAnnotationByResourceId),
            resourceAnnotationByResourceId: territoire.resourceAnnotationByResourceId,
            expressionDomainAnnotationsByEDId: territoire.expressionDomainAnnotationsByEDId,
            territoireGraph: undefined,
            domainGraph: undefined,
            rejectedResourceIds : new ImmutableSet(),
            approvedExpressionDomainIds: undefined
        }
    },
    
    
    render: function() {
        var self = this;
        var props = this.props;
        var state = this.state;
        var territoire = props.territoire;
        
        //throw 'Perf improvement idea: hook to tab events. Manage state here. Only generate the correct child.'
        
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
                    new Tabs(
                        {
                            defaultTabNum: 0,
                            tabNames: ['Pages', 'Domains'],
                            classPrefix: 'tabs-'
                        },
                        // Pages tab content
                        
            
                        //state.pageListItems ?
                            new PagesTab({
                                expressionById: territoire.expressionById,
                                expressionDomainsById: territoire.expressionDomainsById,
                                resourceAnnotationByResourceId: territoire.resourceAnnotationByResourceId,
                                pageGraph: territoire.graph,
                                territoireId: territoire.id,
                                rejectedResourceIds: state.rejectedResourceIds,
                                annotate: function(resourceId, newAnnotations, approved){
                                    newAnnotations = newAnnotations || {}
                                    var resourceAnnotations = territoire.resourceAnnotationByResourceId[resourceId];
                                    
                                    var deltaResourceAnnotations;

                                    deltaResourceAnnotations = Object.assign(
                                        {}, 
                                        newAnnotations, 
                                        {approved: approved}
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

                                    var rejectedResourceIds = state.rejectedResourceIds;
                                    if(approved !== undefined){
                                        rejectedResourceIds = approved ?
                                            rejectedResourceIds.delete(resourceId) :
                                            rejectedResourceIds.add(resourceId);
                                    }

                                    self.setState(Object.assign({}, state, {
                                        resourceAnnotationByResourceId: state.resourceAnnotationByResourceId, // mutated
                                        territoireTags: territoireTags,
                                        rejectedResourceIds: rejectedResourceIds
                                    }));
                                }
                            })// : undefined
                        ,
                        // Domains tab content
                        Object.keys(territoire.expressionById || {}).length >= 1 && state.domainGraph? 
                            new DomainsTab({
                                approvedExpressionDomainIds: state.approvedExpressionDomainIds,
                                expressionDomainAnnotationsByEDId: state.expressionDomainAnnotationsByEDId,
                                expressionDomainsById: territoire.expressionDomainsById,
                                domainGraph: state.domainGraph,
                                annotate: function(expressionDomainId, delta){
                                    annotateExpressionDomain(expressionDomainId, territoire.id, delta)
                                    .catch(function(err){
                                        console.error(
                                            'expression domain annotation update error', 
                                            expressionDomainId, territoire.id, delta, err
                                        );
                                    });
                                    
                                    state.expressionDomainAnnotationsByEDId[expressionDomainId] = Object.assign(
                                        {},
                                        state.expressionDomainAnnotationsByEDId[expressionDomainId],
                                        delta
                                    );
                                    
                                    self.setState(Object.assign({}, state, {
                                        expressionDomainAnnotationsByEDId: state.expressionDomainAnnotationsByEDId // mutated
                                    }));
                                },
                                approveResource: function(resourceId, approved){
                                    var deltaResourceAnnotations = {approved: approved}
                                    
                                    annotateResource(resourceId, territoire.id, deltaResourceAnnotations)
                                    .catch(function(err){
                                        console.error(
                                            'resource annotation from domain update error', 
                                            resourceId, territoire.id, approved, err
                                        );
                                    });
                                    
                                    var rejectedResourceIds = state.rejectedResourceIds;
                                    if(approved !== undefined){
                                        rejectedResourceIds = approved ?
                                            rejectedResourceIds.delete(resourceId) :
                                            rejectedResourceIds.add(resourceId);
                                    }

                                    self.setState(Object.assign({}, state, {
                                        rejectedResourceIds: rejectedResourceIds
                                    }));
                                        
                                }
                            }) : undefined
                    ),
                    
                    React.DOM.div({className: 'exports'},
                        React.DOM.a({
                            href: "/territoire/"+territoire.id+"/expressions.csv",
                            download: true
                        }, 'Download Page CSV'),
                        React.DOM.a({
                            href: "/territoire/"+territoire.id+"/expressions.csv?main_text=true",
                            download: true
                        }, 'Download Page CSV with main text'),
                        React.DOM.a({
                            href: "/territoire/"+territoire.id+"/expressions.gexf",
                            download: territoire.name+'-pages.gexf',
                            onClick: function(e){
                                e.preventDefault();
                                
                                //console.log('before dl', territoire.resourceAnnotationByResourceId, territoire);
                                
                                triggerDownload(
                                    generateExpressionGEXF(
                                        territoire.graph, 
                                        territoire.expressionById, 
                                        territoire.resourceAnnotationByResourceId,
                                        state.expressionDomainAnnotationsByEDId
                                    ),
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
                        }, 'Download Domains GEXF'),
                        React.DOM.a({
                            href: "/territoire/"+territoire.id+"/cognitive-map.gexf",
                            download: territoire.name+'-cognitive-map.gexf',
                            onClick: function(e){
                                e.preventDefault();
                                
                                var cognitiveMapGraph = makeWordGraph(
                                    territoire.graph.nodes,
                                    territoire.expressionById,
                                    state.resourceAnnotationByResourceId
                                );
                                    
                                triggerDownload(
                                    cognitiveMapGraph.exportAsGEXF(),
                                    territoire.name+'-cognitive-map.gexf',
                                    "application/gexf+xml"
                                );
                            }
                        }, 'Download Cognitive Map GEXF')
                    )
                
                )
                
            )
        
        );
    }
});
