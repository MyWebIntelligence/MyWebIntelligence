"use strict";

var React = require('react');
var LoginBox = require('./LoginBox');
var SimpleStart = require('./SimpleStart');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            currentUser: undefined
        }
    },
    
    render: function() {
        var self = this;
        var data = this.props;
        var state = this.state;
        
        var headerChildren = [
            React.DOM.span({}, "My Web Intelligence")
        ];

        if(state.currentUser){
            headerChildren.push(React.DOM.div({className: "user-infos"}, [
                React.DOM.img({className:"avatar", src: state.currentUser.pictureURL}),
                React.DOM.span({className:"username"}, state.currentUser.username)
            ]))
        }
        
        
        var mainChildren = [];
        if(!state.currentUser){
            mainChildren.push(LoginBox({
                onLogin: function(userDesc){
                    self.setState({
                        currentUser: userDesc
                    })
                }
            }));
        }
        else{
            mainChildren.push(SimpleStart());
        }
        
        return React.DOM.div({className: "react-wrapper"}, [
            
            React.DOM.header({}, headerChildren),
            
            React.DOM.main({}, mainChildren)
        
        ]);
    }
});