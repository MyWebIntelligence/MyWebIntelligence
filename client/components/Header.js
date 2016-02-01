"use strict";

var React = require('react');

/*

interface HeaderProps{
    user: MyWIUser
}

*/

module.exports = React.createClass({
    displayName: 'Header',
    
    render: function() {
        var props = this.props;
        
        return React.DOM.section({id: 'sectionConnectHeader'},
            React.DOM.div({id: 'sectionConnectHeaderLogout'},
                React.DOM.i({className: 'fa fa-power-off'})
            ),
            React.DOM.div({id: 'sectionConnectHeaderOracle'},
                React.DOM.i({className: 'fa fa-certificate'}),
                React.DOM.div({id: 'sectionConnectHeaderOracleBox'},
                    React.DOM.div({id: 'sectionConnectHeaderOracleBoxLabel'}, 'Oracle'),
                    React.DOM.div({id: 'sectionConnectHeaderOracleBoxGoogle', className: 'sectionConnectHeaderOracleBox'}, 'Google custom search engine')
                )
            ),
            React.DOM.div({id: 'sectionConnectHeaderPseudo'},
                props.user.name
            )
        );
    }
});
