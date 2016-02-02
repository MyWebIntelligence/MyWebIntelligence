"use strict";

var React = require('react');

var Header = React.createFactory(require('./Header'));
var Navigation = React.createFactory(require('./Navigation'));
var TerritoireForm = React.createFactory(require('./TerritoireForm'));

/*

interface NewTerritoireScreenProps{
    user: MyWIUser
}

*/

module.exports = React.createClass({
    displayName: 'NewTerritoireScreen',
    
    render: function() {
        //var self = this;
        var props = this.props;
        //var state = this.state;
        
        return React.DOM.section({id: "sectionConnect"},
            new Header({
                user: props.user
            }),
            
            React.DOM.section({id: 'sectionConnectContent'},
                new Navigation({activeScreen: 'new-territoire'}),
                React.DOM.section({id: 'sectionBody'},
                    new TerritoireForm({
                        oracles: props.oracles,
                        createTerritoire: function(territoireData){
                            /*var temporaryTerritoire = Object.assign({queries: []}, territoireData);

                            // add at the beginning of the array so it appears first
                            state.user.territoires.unshift(temporaryTerritoire);

                            // some element of the state.user.territoires array was mutated
                            self.setState({
                                user: state.user
                            });*/

                            props.serverAPI.createTerritoire(territoireData).then(function(
                                                                                  //serverTerritoire
                                                                                 ){
                                /*var index = state.user.territoires.findIndex(function(t){
                                    return t === temporaryTerritoire;
                                });

                                serverTerritoire.queries = serverTerritoire.queries || [];
                                state.user.territoires[index] = serverTerritoire;

                                // some element of the state.user.territoires array was mutated
                                self.setState({
                                    user: state.user
                                });*/

                            }).catch(function(err){
                                console.error('TODO add error message to UI', err);
                            });

                        }
                    })             
                )
            )
        
        );
    }
});
