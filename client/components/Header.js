"use strict";

var React = require('react');

var serverAPI = require('../serverAPI');

/*

interface HeaderProps{
    user: MyWIUser,
    oracles: MyWIOracle[]
    oracleCredentials: Object // dictionary key'd on oracleId
    onOracleCredentialsChange: (f: FormData) => void,
    openOracleCredentialsForm: (see state)
}

interface HeaderState{
    openOracleCredentialsForm: Enum ('GCSE'),
}

*/

function onOracleCredentialsChange(formData){
    return serverAPI.updateOracleCredentials(formData);
}

/*

serverAPI.getCurrentUserOraclesCredentials().then(function(credentials){
    var credentialsByOracleId = Object.create(null);

    credentials.forEach(function(c){
        credentialsByOracleId[c.oracle_id] = c.credentials;
    });

    screenData.oracleCredentials = credentialsByOracleId;
    React.render(new OraclesScreen(screenData), document.body);
});

React.render(new OraclesScreen(screenData), document.body);
*/

module.exports = React.createClass({
    displayName: 'Header',
    
    getInitialState: function(){
        return {
            openOracleCredentialsForm: this.props.openOracleCredentialsForm,
            oracleCredentials: Object.create(null),
            serverCredentialsP: undefined
        }
    },
    
    render: function() {
        var self = this;
        var props = this.props;
        var state = this.state;
        
        var o = props.oracles.find(function(or){
            return or.oracle_node_module_name === 'GCSE';
        });
        
        console.log('serverCredentialsP', state.serverCredentialsP)
        
        return React.DOM.section({id: 'sectionConnectHeader'},
            React.DOM.div({id: 'sectionConnectHeaderPseudo'},
                props.user.name
            ),
            React.DOM.div(
                {
                    id: 'sectionConnectHeaderOracle',
                    // only move oracle credentials on mouse over once
                    onMouseOver: state.serverCredentialsP === undefined ? function(){
                        self.setState(Object.assign(
                            state,
                            {
                                serverCredentialsP: serverAPI.getCurrentUserOraclesCredentials()
                                    .then(function(credentials){
                                        var credentialsByOracleId = Object.create(null);

                                        credentials.forEach(function(c){
                                            credentialsByOracleId[c.oracle_id] = c.credentials;
                                        });

                                        self.setState(Object.assign(
                                            state,
                                            {oracleCredentials: credentialsByOracleId}
                                        ))
                                    })
                                    .catch(function(){
                                        self.setState(Object.assign(
                                            state,
                                            {serverCredentialsP: undefined}
                                        ))
                                    })
                            }
                        ))
                    } : undefined 
                },
                React.DOM.i({className: 'fa fa-certificate'}),
                React.DOM.div({id: 'sectionConnectHeaderOracleBox'},
                    React.DOM.div({id: 'sectionConnectHeaderOracleBoxLabel'}, 'Oracle'),
                    React.DOM.div(
                        {
                            id: 'sectionConnectHeaderOracleBoxGoogle',
                            className: 'sectionConnectHeaderOracleBox',
                            onClick: function(e){
                                if(!e.target.matches('#sectionConnectHeaderOracleBoxGoogle > form *')){
                                    self.setState(Object.assign(
                                        state,
                                        {
                                            openOracleCredentialsForm: state.openOracleCredentialsForm !== 'GCSE' ?
                                                'GCSE' :
                                                undefined
                                        }
                                    ));
                                }
                            }
                            
                        },
                        'Google custom search engine',
                        state.openOracleCredentialsForm === 'GCSE' ?
                            React.DOM.form(
                                {
                                    onSubmit: function(e){
                                        e.preventDefault();
                                        var fd = new FormData(e.target);
                                        fd.append('oracle_id', o.id);

                                        onOracleCredentialsChange(fd).then(function(){
                                            self.setState(Object.assign(
                                                state,
                                                { openOracleCredentialsForm: undefined }
                                            ));
                                        });
                                    }
                                },
                                Object.keys(o.credentials_infos).map(function(k){                                
                                    return React.DOM.label({}, [
                                        k + ' ',
                                        React.DOM.input({
                                            type: 'text',
                                            name: k,
                                            value: state.oracleCredentials[o.id] ?
                                                state.oracleCredentials[o.id][k] : 
                                                '',
                                            onChange: function(e){
                                                var delta = {};
                                                delta[k] = e.target.value;

                                                state.oracleCredentials[o.id] = Object.assign({}, state.oracleCredentials[o.id], delta)

                                                self.setState({
                                                    oracleCredentials: state.oracleCredentials
                                                });
                                            }
                                        })
                                    ]);
                                }).concat([React.DOM.button({type: 'submit'}, 'Ok')])
                            ) : undefined
                    )
                )
            )/*,
            React.DOM.div({id: 'sectionConnectHeaderLogout'},
                React.DOM.i({className: 'fa fa-power-off'})
            )*/
        );
    }
});
