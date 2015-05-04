"use strict";

var React = require('react');

var Tabs = require('./external/Tabs.js');

var Header = require('./Header');

/*

interface TerritoireViewScreenProps{
    user: MyWIUser,
    territoire: MyWITerritoire
    moveToOraclesScreen: () => void
}

*/


module.exports = React.createClass({
    getInitialState: function() {
        return {}
    },
    
    render: function() {
        var props = this.props;
        var territoire = props.territoire;
        console.log('Territoire view', props);
                
        return React.DOM.div({className: "react-wrapper"}, [
            new Header({
                 user: props.user,
                 oracleHref: "/oracles"
            }),
            
            React.DOM.main({className: 'territoire'}, [
                //React.DOM.h1({}, ),
                React.DOM.h1({}, [
                    "Territoire "+territoire.name
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
                                return React.DOM.li({}, [
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
