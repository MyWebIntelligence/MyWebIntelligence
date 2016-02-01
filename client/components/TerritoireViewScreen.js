"use strict";

var React = require('react');

var Header = React.createFactory(require('./Header'));
var Navigation = React.createFactory(require('./Navigation'));
var TerritoireViewScreenContent = React.createFactory(require('./TerritoireViewScreenContent'));

/*

interface TerritoiresListScreenProps{
    user: MyWIUser
    serverAPI: MyWIServerAPI,
}

*/


module.exports = React.createClass({
    displayName: 'TerritoireViewScreen',
    
    render: function() {
        var self = this;
        var props = this.props;
        
        return React.DOM.section({id: "sectionConnect"},

            new Header({
                user: props.user
            }),
            
            React.DOM.section({id: 'sectionConnectContent'},
                new Navigation({activeScreen: 'territoire-list'}),
                React.DOM.section({id: 'sectionBody'},
                    new TerritoireViewScreenContent(props)
                )
            )
        
        );
    }
});
