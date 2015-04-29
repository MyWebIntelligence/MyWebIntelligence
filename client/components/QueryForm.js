"use strict";

var React = require('react');

var DeleteButton = React.createFactory(require('./DeleteButton'));

/*

interface QueryFormProps{
    query: MyWIQuery
    oracles: MyWIOracle[]
    deleteQuery: (q: MyWIQuery) => void
}

*/

module.exports = React.createClass({
    getInitialState: function(){
        var props = this.props
        return {
            selectedOracleId: (props.query && props.query.oracle_id) || props.oracles[0].id
        };
    },
    
    render: function(){
        var self = this;
        var props = this.props;
        var state = this.state;
        console.log('oracles', props.oracles);
        
        var editionMode = !!props.query; // by opposition to creationMode
        var query = props.query || {};
        var selectedOracle = props.oracles.find(function(o){
            return o.id === state.selectedOracleId
        });
        var queryOracleOptions = (query.oracleOptions && JSON.parse(query.oracleOptions)) || {};
        
        
        return React.DOM.div({className: "QueryForm-react-component"}, [
            React.DOM.form({
                className: "query",
                onSubmit: function(e){
                    e.preventDefault();

                    var formData = Object.create(null);
                    
                    formData.name = self.refs['form-name'].getDOMNode().value.trim();
                    
                    if(!editionMode){    
                        formData.q = self.refs['form-q'].getDOMNode().value;
                        formData.oracle_id = Number( self.refs['form-oracle_id'].getDOMNode().value );
                    }
                    
                    var oracleOptionsSection = self.refs['oracle-options'];
                    var oracleOptionInputs = oracleOptionsSection.getDOMNode().querySelectorAll('input[name], select[name], textarea[name]');
                    
                    var oracleOptions = Object.create(null);
                    
                    Array.from(oracleOptionInputs).forEach(function(input){
                        var id = input.name;
                        var value;
                        
                        var type = selectedOracle.options.find(function(opt){
                            return opt.id === id;
                        }).type;
                        
                        if(type === 'list'){
                            value = input.value.split('\n').map(function(str){
                                return str.trim();
                            });
                        }
                        else{
                            if(type === 'boolean'){
                                value = input.checked;
                            }
                            else{
                                value = input.value;
                            }
                        }
                        
                        oracleOptions[id] = value;
                    });
                    
                    formData.oracleOptions = JSON.stringify(oracleOptions);
                    
                    
                    console.log('formData', formData);

                    props.onSubmit(formData);
                }
            }, [
                React.DOM.section({className: "table-layout"}, [
                    React.DOM.h1({}, "Query settings"),
                    React.DOM.label({}, [
                        React.DOM.span({}, 'name'),
                        React.DOM.input({
                            ref: "form-name",
                            name: 'name',
                            type: 'text',
                            required: true,
                            pattern: '\\s*(\\S+\\s*)+', 

                            // browsers auto-complete based on @name and here it's "name" which is common
                            // so autocompletion values aren't that useful. This isn't very autocompletable anyway
                            autoComplete: 'off',
                            defaultValue: query.name
                        })
                    ]),
                    React.DOM.label({}, [
                        React.DOM.span({}, 'query string'),
                        editionMode ?
                            React.DOM.span({}, query.q) :
                            React.DOM.input({
                                ref: "form-q",
                                name: 'q',
                                required: true,
                                type: 'text'
                            })
                    ]),
                    React.DOM.label({}, [
                        React.DOM.span({}, 'oracle'),
                        editionMode ?
                            React.DOM.span({}, selectedOracle.name) :
                            React.DOM.select({
                                ref: "form-oracle_id",
                                name: 'oracle_id',
                                defaultValue: state.selectedOracleId,
                                onChange: function(e){
                                    self.setState({
                                        selectedOracleId: Number(e.target.value)
                                    })
                                }
                            }, props.oracles.map(function(o){
                                return React.DOM.option({
                                    value: o.id
                                }, o.name)
                            }))
                    ])
                ]),
                selectedOracle.options ? React.DOM.section({ref: 'oracle-options', className: "table-layout"}, [
                    React.DOM.h1({}, "Oracle options"),
                    
                    selectedOracle.options.map(function(opt){
                        var id = opt.id;
                        var input;
                        
                        if(Array.isArray(opt.type)){ // enum
                            input = React.DOM.select({
                                name: id,
                                defaultValue: queryOracleOptions[id]
                            }, opt.type.map(function(v){
                                return React.DOM.option({value: v}, v);
                            }));
                        }
                        else{
                            if(opt.type === 'list'){
                                input = React.DOM.textarea({
                                    name: id,
                                    defaultValue: queryOracleOptions[id],
                                    rows: 5
                                })
                            }
                            else{
                                if(opt.type === 'boolean'){
                                    input = React.DOM.input({
                                        name: id,
                                        defaultChecked: queryOracleOptions[id],
                                        type: 'checkbox'
                                    });
                                }
                                else{
                                    console.error('unknown oracle option type', opt.type, selectedOracle.name, opt.name, opt.id);
                                }
                            }
                        }
                        
                        return React.DOM.label({}, [
                            React.DOM.span({}, opt.name),
                            input
                        ]);
                    })
                ]) : undefined,
                React.DOM.button({
                    type: "submit"
                }, "ok")
            ]),
            props.query ? new DeleteButton({
                onDelete: function(){
                    props.deleteQuery(props.query);
                }
            }) : undefined
        ]);
    }
});
