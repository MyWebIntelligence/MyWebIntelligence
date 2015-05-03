"use strict";

var React = require('react');

/*

interface HeaderProps{
    user: MyWIUser,
    oracleHref: string
}

*/

module.exports = React.createClass({
    getInitialState: function() {
        return {
            user: this.props.user
        };
    },
    
    render: function() {
        var props = this.props;
        var state = this.state;
        
        var headerChildren = [React.DOM.a({href:"/"}, "My Web Intelligence")];
        
        if(props.user){
            headerChildren.push(React.DOM.div({className: "user-infos"}, [
                React.DOM.a({
                    href: props.oracleHref
                }, "Oracles"),
                React.DOM.img({className:"avatar", src: state.user.pictureURL}),
                React.DOM.span({className:"username"}, state.user.name)
            ]));
        }
        
        return React.DOM.header({}, headerChildren);
    }
});
