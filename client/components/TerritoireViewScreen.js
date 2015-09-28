"use strict";

var React = require('react');

var ImmutableSet = require('immutable').Set;

var Tabs = React.createFactory(require('./external/Tabs.js'));
var Header = React.createFactory(require('./Header'));
var DomainGraph = React.createFactory(require('./DomainGraph'));
var PageListItem = React.createFactory(require('./PageListItem'));

var abstractGraphToPageGraph = require('../../common/graph/abstractGraphToPageGraph');
var pageGraphToDomainGraph = require('../../common/graph/pageGraphToDomainGraph');
var getAbstractGraphHostnames = require('../../common/graph/getAbstractGraphHostnames');

var getAlexaRanks = require('../serverAPI/getAlexaRanks')
var annotate = require('../serverAPI').annotate;

/*

interface TerritoireViewScreenProps{
    user: MyWIUser,
    territoire: MyWITerritoire,
    refresh: function(){}: void
}

*/

function generateExpressionGEXF(abstractGraph, expressionById, annotationsById){
    var pageGraph = abstractGraphToPageGraph(abstractGraph, expressionById, annotationsById);
    
    return pageGraph.exportAsGEXF();
}


function generateDomainGEXF(abstractGraph, expressionById, annotationsById, expressionDomainById){
    var pageGraph = abstractGraphToPageGraph(abstractGraph, expressionById, annotationsById);
    var graphHostname = getAbstractGraphHostnames(abstractGraph);
    
    var domainGraphP = getAlexaRanks(graphHostname)
        .then(function(alexaRanks){
            console.log("alexaRanks", alexaRanks.size, alexaRanks);
            
            return pageGraphToDomainGraph(pageGraph, alexaRanks, expressionDomainById);
        });
    
    return domainGraphP.then(function(domainGraph){
        return domainGraph.exportAsGEXF();
    })
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
    
    _refreshTimeout: undefined,
    _scheduleRefreshIfNecessary: function(){        
        var props = this.props;
        var self = this;
        var t = props.territoire;
        var crawlTodoCount = t && t.progressIndicators && t.progressIndicators.crawlTodoCount;
        
        console.log("scheduleRefreshIfNecessary", crawlTodoCount, t.graph && t.graph.edges.length, self._refreshTimeout);
        
        // for perceived performance purposes, sometimes only a graph with the query results is sent initially.
        // refresh the graph if no edge was found in the graph
        if( self._refreshTimeout === undefined && ((crawlTodoCount && crawlTodoCount >= 1) || (t.graph && t.graph.edges.length === 0))){
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
        
        console.log('componentWillReceiveProps territoire.annotationByResourceId', territoire.annotationByResourceId, territoire)
        this.setState(Object.assign({}, this.state, {
            annotationByResourceId: territoire.annotationByResourceId,
            territoireTags: computeTerritoireTags(territoire.annotationByResourceId)
        }));
    },
    
    getInitialState: function() {
        var territoire = this.props.territoire;
                
        console.log('getInitialState annotationByResourceId', territoire.annotationByResourceId, territoire);
        
        return {
            territoireTags: computeTerritoireTags(territoire.annotationByResourceId),
            annotationByResourceId: territoire.annotationByResourceId,
            territoireGraph: undefined,
            domainGraph: undefined
        }
    },
    
    displayName: 'TerritoireViewScreen',
    
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
                    state.annotationByResourceId
                ),
                undefined,
                territoire.expressionDomainsById
            )
            
            // this is ugly
            setTimeout(function(){
                self.setState(Object.assign({}, state, {
                    domainGraph: domainGraph,
                    territoireGraph: territoire.graph
                }));
            }, 20)
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
                        // so that clicking on an auto-complete value does autocomplete without the user
                        // doesn't have to hit ';' itself
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
                        React.DOM.span({title: "Crawl todo"}, territoire.progressIndicators.crawlTodoCount),
                        '-',
                        React.DOM.span({title: "Expressions"}, Object.keys(territoire.expressionById || {}).length)
                    ) : undefined
                ),
                
                React.DOM.div({className: 'tabs-and-exports'},
                    new Tabs({
                        defaultTabNum: 0,
                        tabNames: ['Pages', 'Domains'],
                        classPrefix: 'tabs-'
                    }, [
                        // Pages tab content
                        Object.keys(territoire.expressionById || {}).length >= 1 ? React.DOM.ul(
                            {className: 'result-list'}, 
                            territoire.graph.nodes.map(function(node){
                                var expressionId = node.expression_id;
                                var resourceId = node.id;
                                if(expressionId === null || expressionId === undefined)
                                    return;
                                
                                var expression = territoire.expressionById[expressionId];
                                                      
                                return new PageListItem({
                                    resourceId: resourceId,

                                    url: node.url,
                                    title: expression.title,
                                    excerpt: expression.excerpt,
                                    
                                    annotations: state.annotationByResourceId ? state.annotationByResourceId[resourceId] : {tags: new Set()},
                                    annotate: function(newAnnotations, approved){
                                        // TODO add a pending state or something
                                        annotate(resourceId, territoire.id, newAnnotations, approved)
                                            .catch(function(err){
                                                console.error('annotation update error', resourceId, territoire.id, newAnnotations, err);
                                            });
                                        
                                        var territoireTags = state.territoireTags;
                                        
                                        // add tags for autocomplete
                                        newAnnotations.tags.forEach(function(t){
                                            territoireTags = territoireTags.add(t);
                                        });
                                                                            
                                        state.annotationByResourceId[resourceId] = newAnnotations;
                                        
                                        self.setState(Object.assign({}, state, {
                                            annotationByResourceId: state.annotationByResourceId, // mutated
                                            territoireTags: territoireTags
                                        }));
                                    }
                                });
                            })
                        ) : undefined,
                        // Domains tab content
                        new DomainGraph({
                            graph: state.domainGraph ? state.domainGraph : undefined
                        })
                    ]),
                    
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
                                
                                //console.log('before dl', territoire.annotationByResourceId, territoire);
                                
                                triggerDownload(
                                    generateExpressionGEXF(territoire.graph, territoire.expressionById, territoire.annotationByResourceId),
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
                                
                                generateDomainGEXF(territoire.graph, territoire.expressionById, state.annotationByResourceId, territoire.expressionDomainsById)
                                    .then(function(domainsGEXF){
                                        triggerDownload(
                                            domainsGEXF,
                                            territoire.name+'-domains.gexf',
                                            "application/gexf+xml"
                                        );
                                    })
                                    .catch(function(err){
                                        console.error('generateDomainGEXF error', err, err.stack);
                                    });
                            }
                        }, 'Download Domains GEXF')
                    )
                
                )
                
            )
        
        );
    }
});
