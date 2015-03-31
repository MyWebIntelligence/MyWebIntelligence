"use strict";

var React = require('react');

var Header = require('./Header');

/*

interface TerritoireViewScreenProps{
    currentUser: MyWIUser,
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
        
        var state = this.state;
        
        return React.DOM.div({className: "react-wrapper"}, [
            new Header({
                 user: state.currentUser,
                 moveToOraclesScreen: props.moveToOracleScreen
            }),
            
            React.DOM.main({className: 'territoire'}, [
                //React.DOM.h1({}, ),
                React.DOM.h1({className: 'exports'}, [
                    "Territoire "+territoire.name,
                    React.DOM.a({href: "/territoire/"+territoire.id+"/expressions.csv"}, 'Download Pages CSV'),
                    React.DOM.a({href: "/territoire/"+territoire.id+"/expressions.gexf"}, 'Download Pages GEXF'),
                    React.DOM.a({href: "/territoire/"+territoire.id+"/domains.gexf"}, 'Download Domains GEXF')
                ]),
                
                territoire.resultList ? React.DOM.ul({className: 'result-list'}, territoire.resultList.map(function(r){
                    return React.DOM.li({}, [
                        React.DOM.a({ href: r.url, target: '_blank' }, [
                            React.DOM.h3({}, r.title),
                            React.DOM.h4({}, r.url)
                        ]),
                        React.DOM.div({ className: 'excerpt' }, r.excerpt)
                    ]);
                })) : undefined
            ])
        
        ]);
    }
});
