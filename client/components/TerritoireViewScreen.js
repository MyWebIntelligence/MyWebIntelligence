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
        var self = this;
        var props = this.props;
        var state = this.state;
        
        return React.DOM.div({className: "react-wrapper"}, [
            Header({
                 user: state.currentUser,
                 moveToOraclesScreen: props.moveToOracleScreen
            }),
            
            React.DOM.main({className: 'territoire'}, [
                React.DOM.h1({}, "Territoire "+props.territoire.name),
                props.territoire.queries ? React.DOM.ul({className: 'queries'}, props.territoire.queries.map(function(q){
                    return React.DOM.li({}, [
                        React.DOM.h2({}, q.name),
                        q.oracleResults ? React.DOM.ul({className: 'oracle-results'}, q.oracleResults.map(function(res){
                            return React.DOM.li({}, React.DOM.a({href: res.link, target: '_blank'}, [
                                React.DOM.h3({}, res.title),
                                React.DOM.h4({}, res.link)
                            ]))
                        })) : undefined
                    
                    ]);
                })) : undefined
            ])
        
        ]);
    }
});