"use strict";

var React = require('react');

var Header = React.createFactory(require('./Header'));
var Navigation = React.createFactory(require('./Navigation'));
var TerritoireForm = React.createFactory(require('./TerritoireForm'));

/*

interface NewTerritoireScreenProps{
    user: MyWIUser,
    oracles: MyWIOracle[]
    createTerritoire: (terrData) => Promise<> 
}

*/

module.exports = React.createClass({
    displayName: 'NewTerritoireScreen',
    
    render: function() {
        var props = this.props;

        return React.DOM.section({id: "sectionConnect"},
            new Header({
                user: props.user
            }),
            
            React.DOM.section({id: 'sectionConnectContent'},
                new Navigation({activeScreen: 'new-territoire'}),
                React.DOM.section({id: 'sectionBody'},
                    new TerritoireForm({
                        oracles: props.oracles,
                        onSubmit: function(territoireData){
                            props.createTerritoire(territoireData);
                        }
                    })             
                )
            )
        
        );
    }
});
