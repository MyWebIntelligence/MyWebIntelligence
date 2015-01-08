"use strict";

var React = require('react');

module.exports = React.createClass({
    getInitialState: function(){
        return {
            openTerritoires: []
        };
    },
    
    render: function(){
        var props = this.props;
        var state = this.state;
        var self = this;
        
        console.log('props', props);
        
        return React.DOM.ul({}, props.territoires.map(function(t){
            return React.DOM.li({
                className: "territoire"
            }, t.name);
        }));
    }
});