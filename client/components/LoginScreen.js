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
        return {};
    },
    
    render: function() {
        var props = this.props;
        
        return React.DOM.div({className: "react-wrapper"}, [
            new Header(),
            
            React.DOM.main({className: "login"}, new LoginBox({
                onLogin: function(){
                    props.moveToTerritoiresScreen();
                }
            }))
        
        ]);
    }
});
