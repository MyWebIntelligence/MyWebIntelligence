"use strict";

var React = require('react');

var Tabs = require('./external/Tabs.js');
var Header = require('./Header');

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

function generateExpressionGEXF(abstractGraph, expressionById){
    var pageGraph = abstractGraphToPageGraph(abstractGraph, expressionById);
    
    return pageGraph.exportAsGEXF();
}


function generateDomainGEXF(abstractGraph, expressionById){
    var pageGraph = abstractGraphToPageGraph(abstractGraph, expressionById);
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
    
    refreshTimeout: undefined,
    scheduleRefreshIfNecessary: function(){        
        var props = this.props;
        var t = props.territoire;
        var crawlTodoCount = t && t.progressIndicators && t.progressIndicators.crawlTodoCount;
        
        console.log("scheduleRefreshIfNecessary", crawlTodoCount);
        
        if(crawlTodoCount && crawlTodoCount >= 1){
            this.refreshTimeout = setTimeout(function(){
                this.refreshTimeout = undefined;
                props.refresh();
            }, 5*1000);
        }
    },
    
    // maybe schedule a refresh on mount and when receiving props
    componentDidMount: function(){
        this.scheduleRefreshIfNecessary();
    },
    componentDidUpdate: function(){
        this.scheduleRefreshIfNecessary();
    },
    
    componentWillUnmount: function(){
        clearTimeout(this.refreshTimeout);
    },
    
    getInitialState: function() {
        return {}
    },
    
    render: function() {
        var props = this.props;
        var territoire = props.territoire;
        
        //console.log('territoire', territoire);
        
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
                        territoire.resultListByDomain ? React.DOM.ul(
                            {className: 'result-list'},
                            territoire.resultListByDomain.map(function(r){
                                return React.DOM.li({}, [
                                    React.DOM.a({ href: r.url, target: '_blank' }, [
                                        React.DOM.h3({}, r.domain)
                                    ]),
                                    React.DOM.div({ className: 'excerpt' }, r.count)
                                ]);
                            })
                        ) : undefined
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
                                
                                triggerDownload(
                                    generateExpressionGEXF(territoire.graph, territoire.expressionById),
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
                                
                                generateDomainGEXF(territoire.graph, territoire.expressionById, getAlexaRanks)
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
