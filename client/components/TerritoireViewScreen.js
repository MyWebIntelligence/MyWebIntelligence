"use strict";

var React = require('react');

var Tabs = require('./external/Tabs.js');

var Header = require('./Header');

/*

interface TerritoireViewScreenProps{
    user: MyWIUser,
    territoire: MyWITerritoire,
    refresh: function(){}: void
}

*/


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
        
        console.log('territoire', territoire);
        
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
                        React.DOM.span({title: "Expressions"}, territoire.resultListByPage.filter(function(r){
                            return r.expressionId !== null;
                        }).length)
                    ]) : undefined
                ]),
                
                React.DOM.div({className: 'tabs-and-exports'}, [
                    new Tabs({
                        defaultTabNum: 0,
                        tabNames: ['Pages', 'Domains'],
                        classPrefix: 'tabs-'
                    }, [
                        // Pages tab content
                        territoire.resultListByPage ? React.DOM.ul(
                            {className: 'result-list'}, 
                            territoire.resultListByPage.map(function(r){
                                if(r.expressionId === null) // shallow node
                                    return undefined;
                                
                                // node backed by actual expression
                                return React.DOM.li({"data-expression-id": r.expressionId}, [
                                    React.DOM.a({ href: r.url, target: '_blank' }, [
                                        React.DOM.h3({}, r.title),
                                        React.DOM.h4({}, r.url)
                                    ]),
                                    React.DOM.div({ className: 'excerpt' }, r.excerpt)
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
                            download: true
                        }, 'Download Pages GEXF'),
                        React.DOM.a({
                            href: "/territoire/"+territoire.id+"/domains.gexf",
                            download: true
                        }, 'Download Domains GEXF')
                    ])
                
                ])
                
            ])
        
        ]);
    }
});
