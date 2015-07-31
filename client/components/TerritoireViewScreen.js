"use strict";

var React = require('react');

var Tabs = require('./external/Tabs.js');
var Header = require('./Header');
var DomainGraph = require('./DomainGraph');

var abstractGraphToPageGraph = require('../../common/graph/abstractGraphToPageGraph');
var pageGraphToDomainGraph = require('../../common/graph/pageGraphToDomainGraph');
var getAbstractGraphHostnames = require('../../common/graph/getAbstractGraphHostnames');

var getAlexaRanks = require('../serverAPI/getAlexaRanks')

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


function generateDomainGEXF(abstractGraph, expressionById, annotationsById){
    var pageGraph = abstractGraphToPageGraph(abstractGraph, expressionById, annotationsById);
    var graphHostname = getAbstractGraphHostnames(abstractGraph);
    
    var domainGraphP = getAlexaRanks(graphHostname)
        .then(function(alexaRanks){
            console.log("alexaRanks", alexaRanks.size, alexaRanks);
            
            return pageGraphToDomainGraph(pageGraph, alexaRanks);
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
    
    getInitialState: function() {
        return {
            territoireGraph: undefined,
            domainGraph: undefined
        }
    },
    
    render: function() {
        var self = this;
        var props = this.props;
        var state = this.state;
        var territoire = props.territoire;
        
        console.log('territoire', territoire, territoire.graph && territoire.graph.edges.length);
        
        if(territoire.graph && state.territoireGraph !== territoire.graph){
            pageGraphToDomainGraph(
                abstractGraphToPageGraph(
                    territoire.graph, 
                    territoire.expressionById, 
                    territoire.annotationByResourceId
                )
            ).then(function(domainGraph){
                self.setState({
                    domainGraph: domainGraph,
                    territoireGraph: territoire.graph
                })
            })
            
        }
        
        return React.DOM.div({className: "react-wrapper"}, [
            new Header({
                 user: props.user,
                 oracleHref: "/oracles"
            }),
            
            React.DOM.main({className: 'territoire'}, [
                React.DOM.header({}, [
                    React.DOM.h1({}, [
                        "Territoire "+territoire.name
                    ]),
                    territoire.progressIndicators ? React.DOM.h2({}, [
                        React.DOM.span({title: "Query oracle results"}, territoire.progressIndicators.queriesResultsCount),
                        '-',
                        React.DOM.span({title: "Crawl todo"}, territoire.progressIndicators.crawlTodoCount),
                        '-',
                        React.DOM.span({title: "Expressions"}, Object.keys(territoire.expressionById || {}).length)
                    ]) : undefined
                ]),
                
                React.DOM.div({className: 'tabs-and-exports'}, [
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
                                if(expressionId === null || expressionId === undefined)
                                    return;
                                
                                var expression = territoire.expressionById[expressionId];
                                                                
                                // node backed by actual expression
                                return React.DOM.li({"data-expression-id": expressionId}, [
                                    React.DOM.a({ href: node.url, target: '_blank' }, [
                                        React.DOM.h3({}, expression.title),
                                        React.DOM.h4({}, node.url)
                                    ]),
                                    React.DOM.div({ className: 'excerpt' }, expression.excerpt)
                                ]);
                            })
                        ) : undefined,
                        // Domains tab content
                        new DomainGraph({
                            graph: state.domainGraph ? state.domainGraph : undefined
                        })
                    ]),
                    
                    React.DOM.div({className: 'exports'}, [
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
                                
                                generateDomainGEXF(territoire.graph, territoire.expressionById, territoire.annotationByResourceId)
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
                    ])
                
                ])
                
            ])
        
        ]);
    }
});
