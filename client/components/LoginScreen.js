"use strict";

var React = require('react');

var Header = require('./Header');
var LoginBox = React.createFactory(require('./LoginBox'));

/*

interface LoginScreenProps{
    moveToTerritoiresScreen : () => void
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
            
            React.DOM.main({className: "login"}, LoginBox({
                onLogin: function(){
                    props.moveToTerritoiresScreen();
                }
            }))
        
        ]);
    }
});