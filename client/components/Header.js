"use strict";

var React = require('react');

/*

interface HeaderProps{
    user: MyWIUser
}

*/

module.exports = React.createClass({
    getInitialState: function() {
        return {
            currentUser: this.props.user
        }
    },
    
    render: function() {
        var self = this;
        var props = this.props;
        var state = this.state;
        
        var headerChildren = [React.DOM.span({}, "My Web Intelligence")];
        
        if(props.user){
            headerChildren.push(React.DOM.div({className: "user-infos"}, [
                React.DOM.a({
                    href:"/oracles",
                    onClick: function(e){
                        e.preventDefault();
                    }
                }, "Oracles"),
                React.DOM.img({className:"avatar", src: state.currentUser.pictureURL}),
                React.DOM.span({className:"username"}, state.currentUser.name)
            ]));
        }
        
        return React.DOM.header({}, headerChildren);
    }
});
            