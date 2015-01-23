"use strict";

var React = require('react');

var Header = require('./Header');

/*

interface OraclesScreenProps{
    user: MyWIUser
    oracles: MyWIOracle[]
    oracleCredentials: MyWIOracleCredentials[]
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
            Header(),
            React.DOM.h1({}, "Oracles"),
            React.DOM.ul({className: 'oracles'}, props.oracles.map(function(o){
                return React.DOM.li({}, o.name);
            }))
        ]);
    }
});
            