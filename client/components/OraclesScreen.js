"use strict";

var React = require('react');

var Header = require('./Header');

/*

interface OraclesScreenProps{
    user: MyWIUser
    oracles: MyWIOracle[]
    oracleCredentials: Object // dictionary key'd on oracleId
    onOracleCredentialsChange: (f: FormData) => void
}

*/

module.exports = React.createClass({
    getInitialState: function() {
        var oracleCredentials = this.props.oracleCredentials ? this.props.oracleCredentials : Object.create(null);
        
        return {
            oracleCredentials: oracleCredentials
        };
    },
    
    componentWillReceiveProps: function(newProps){
        var oracleCredentials = newProps.oracleCredentials ? newProps.oracleCredentials : Object.create(null);
        
        this.setState({
            oracleCredentials: oracleCredentials
        });
    },
    
    render: function() {
        var props = this.props;
        var state = this.state;
        
        return React.DOM.div({className: "react-wrapper"}, [
            new Header({user: props.user}),
            React.DOM.main({className: 'oracles'}, [
                React.DOM.h1({}, "Oracles"),
                React.DOM.ul({className: 'oracles'}, props.oracles.map(function(o){
                    
                    var liChildren = [o.name];
                    
                    if(o.needsCredentials){
                        liChildren.push(
                            React.DOM.form({
                                onSubmit: function(e){
                                    e.preventDefault();
                                    var fd = new FormData(e.target);
                                    fd.append('oracleId', o.id);
                                    
                                    props.onOracleCredentialsChange(fd);
                                }
                            }, Object.keys(o.needsCredentials).map(function(k){                                
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
                            }).concat([React.DOM.button({type: 'submit'}, 'Ok')]))
                        )
                    }
                    
                    return React.DOM.li({}, liChildren);
                }))
            ])
        ]);
    }
});
