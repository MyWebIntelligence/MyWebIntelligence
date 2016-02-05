"use strict";

var React = require('react');

var LoginBox = React.createFactory(require('./LoginBox'));

/*

interface LoginScreenProps{
    moveToTerritoiresScreen : () => void
}

*/


module.exports = React.createClass({
    displayName: 'LoginScreen',
    
    getInitialState: function() {
        return {};
    },
    
    render: function() {
        var props = this.props;
        
        return React.DOM.section({id: 'sectionConnexion'},
            React.DOM.div({id: 'sectionConnexionBox'},
                React.DOM.div({id: 'sectionConnexionBoxContent'},
                    new LoginBox({
                        onLogin: function(){
                            props.moveToTerritoiresScreen();
                        }
                    })      
                )
            )
        )
    }
});
