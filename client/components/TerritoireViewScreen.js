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
                React.DOM.h1({}, "Territoire "+territoire.name),
                React.DOM.section({className: 'exports'}, [
                    React.DOM.a({href: "/territoire/"+territoire.id+"/expressions.csv"}, 'Download Pages CSV'),
                    React.DOM.a({href: "/territoire/"+territoire.id+"/expressions.gexf"}, 'Download Pages GEXF'),
                    React.DOM.a({href: "/territoire/"+territoire.id+"/domains.gexf"}, 'Download Domains GEXF')
                ]),
                
                props.territoire.queries ? React.DOM.ul({className: 'queries'}, props.territoire.queries.map(function(q){
                    return React.DOM.li({}, [
                        React.DOM.h2({}, q.name),
                        (q.oracleResults ?
                            React.DOM.span({className: 'oracle-results'}, q.oracleResults.length) :
                            undefined)
                    ]);
                })) : undefined
            ])
        
        ]);
    }
});
