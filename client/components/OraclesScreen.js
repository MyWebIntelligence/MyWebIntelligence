"use strict";

var React = require('react');

var Header = require('./Header');

/*

interface OraclesScreenProps{
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
        
        
        return React.DOM.div({className: "react-wrapper"}, [
            Header(),
            
            React.DOM.main({className: ""}, LoginBox({
                onLogin: function(){
                    props.moveToTerritoiresScreen();
                }
            }))
        
        ]);
    }
});
            