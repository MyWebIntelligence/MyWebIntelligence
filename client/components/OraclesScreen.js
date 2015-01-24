"use strict";

var React = require('react');

var Header = require('./Header');

/*

interface OraclesScreenProps{
    user: MyWIUser
    oracles: MyWIOracle[]
    oracleCredentials: Map<string, any>
    onOracleCredentialsChange: (f: FormData) => void
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
            Header({user: props.user}),
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
                                        defaultValue: props.oracleCredentials && props.oracleCredentials[o.id] ?
                                        props.oracleCredentials[o.id][k] : undefined
                                    })
                                ])
                            }).concat([React.DOM.button({type: 'submit'}, 'Ok')]))
                        )
                    }
                    
                    return React.DOM.li({}, liChildren);
                }))
            ])
        ]);
    }
});
            