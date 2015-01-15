"use strict";

var React = require('react');

// If the action is very short, do not display the spinner right away. Wait for INSTANT_DELAYms
var INSTANT_DELAY = 500;

module.exports = React.createClass({
    getInitialState: function() {
        
        /*
            If the action is very short, do not display the spinner right away.
            instantTimeout is a timeout that represents the wait before showing the spinner
        */
        
        return {
            renderNow: false,
            fadeIn: false
        };
    },
    
    componentDidMount: function(){
        var self = this;
        this.getDOMNode().addEventListener('transitionend', function(e){
            self.setState({
                renderNow: true,
                fadeIn: !self.state.fadeIn
            });
        });
    },
    
    render: function() {
        var data = this.props;
        var state = this.state;
        var self = this;
        
        if(data.active){
            if(!state.renderNow){
                setTimeout(function(){
                    console.log('in-timeout');
                    self.setState({
                        renderNow: true,
                        fadeIn: true
                    })
                }, INSTANT_DELAY);
            }
        }
        
        return React.DOM.span({
            className: "spinner" + (state.fadeIn ? " fadein" : ""), 
            hidden: !data.active
        }, '');
    }
});
    