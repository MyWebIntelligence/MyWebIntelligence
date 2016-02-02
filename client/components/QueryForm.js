"use strict";

var React = require('react');
var moment = require('moment');

//var cleanupURLs = require('../../common/cleanupURLs');

//var DeleteButton = React.createFactory(require('./DeleteButton'));

/*

interface QueryFormProps{
    query: MyWIQuery
    oracles: MyWIOracle[]
    deleteQuery: (q: MyWIQuery) => void
}

*/

module.exports = React.createClass({
    displayName: 'QueryForm',
    
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
        
        var query = props.query || {};
        var selectedOracle = props.oracles.find(function(o){
            return o.id === state.selectedOracleId
        });
        var queryOracleOptions = query.oracle_options || {};
            
        var territoireFormQuery = React.DOM.div({className: 'territoryFormQuery'},
            React.DOM.div({className: 'territoryFormQueryTitre'}, 'Query settings'),
            React.DOM.div({className: 'territoryFormQueryLine'}, 
                React.DOM.div({className: 'territoryFormQueryLineLabel'}, 'Name'),
                React.DOM.div({className: 'territoryFormQueryLineInput'},
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
                )
            ),
            React.DOM.div({className: 'territoryFormQueryLine'}, 
                React.DOM.div({className: 'territoryFormQueryLineLabel'}, 'Query string'),
                React.DOM.div({className: 'territoryFormQueryLineInput'},
                    React.DOM.input({
                        ref: "form-q",
                        name: 'q',
                        required: true,
                        type: 'text',
                        defaultValue: query.q
                    })
                )
            ),
            React.DOM.div({className: 'territoryFormQueryLine'},
                React.DOM.div({className: 'territoryFormQueryLineLabel'}, 'Oracle'),
                React.DOM.div({className: 'territoryFormQueryLineInput'},
                    React.DOM.select({
                        ref: "form-oracle_id",
                        name: 'oracle_id',
                        defaultValue: state.selectedOracleId,
                        onChange: function(e){
                            self.setState({
                                selectedOracleId: e.target.value
                            })
                        }
                    }, props.oracles.map(function(o){
                        return React.DOM.option({
                            value: o.id
                        }, o.name)
                    }))
                )
            ),
            selectedOracle.options ? selectedOracle.options.map(function(opt){
                var id = opt.id;
                var input;

                var defaultValue = queryOracleOptions[id];

                if(selectedOracle.name === "Google Custom Search Engine" && opt.id === "lr" && !defaultValue){
                    defaultValue = 'lang_'+( (typeof navigator !== 'undefined' && navigator.language) || 'en');
                }

                if(Array.isArray(opt.type)){ // enum
                    input = React.DOM.select({
                        name: id,
                        "data-oracle-option-id": id,
                        defaultValue: defaultValue
                    }, opt.type.map(function(optOpt){
                        return React.DOM.option({
                            value: optOpt.value,
                            key: optOpt.value
                        }, optOpt.text)
                    }));
                }
                else{
                    switch(opt.type){
                        case 'list':
                            input = React.DOM.textarea({
                                "data-oracle-option-id": id,
                                name: id,
                                defaultValue: (queryOracleOptions[id] || []).join('\n'),
                                rows: 5
                            })
                            break;
                        case 'boolean':
                            input = React.DOM.input({
                                "data-oracle-option-id": id,
                                name: id,
                                defaultChecked: queryOracleOptions[id],
                                type: 'checkbox'
                            });
                            break;
                        case 'number':
                            input = React.DOM.input({
                                "data-oracle-option-id": id,
                                name: id,
                                defaultValue: queryOracleOptions[id] || opt.default,
                                min: opt.min,
                                max: opt.max,
                                step: opt.step,
                                type: 'number'
                            });
                            break;
                        case 'date range':
                            input = React.DOM.div(
                                {
                                    "data-oracle-option-id": id,
                                    className: 'date-range-input'
                                },
                                React.DOM.input({
                                    name: 'from',
                                    defaultValue: (queryOracleOptions[id] || {}).from ||
                                        moment().subtract(2, 'years').format('YYYY-MM-DD'),
                                    placeholder: 'YYYY-MM-DD',
                                    type: 'date'
                                }),
                                React.DOM.input({
                                    name: 'to',
                                    defaultValue: (queryOracleOptions[id] || {}).to || 
                                        moment().format('YYYY-MM-DD'),
                                    placeholder: 'YYYY-MM-DD',
                                    type: 'date'
                                })
                            );
                            break;
                        default:
                            console.error('unknown oracle option type', opt.type, selectedOracle.name, opt.name, opt.id);
                    }
                }

                return React.DOM.div({className: 'territoryFormQueryLine'}, 
                    React.DOM.div({className: 'territoryFormQueryLineLabel'}, opt.name),
                    React.DOM.div({className: 'territoryFormQueryLineInput'}, input)
                );
            }) : undefined            
        )


        /*
        React.DOM.form({
            className: "query",
            onSubmit: function(e){
                e.preventDefault();

                var formData = Object.create(null);

                formData.name = self.refs['form-name'].getDOMNode().value.trim();

                if(!editionMode){    
                    formData.q = self.refs['form-q'].getDOMNode().value;
                    formData.oracle_id = self.refs['form-oracle_id'].getDOMNode().value;
                }

                var oracleOptionsSection = self.refs['oracle-options'];
                var oracleOptionElements = oracleOptionsSection.getDOMNode().querySelectorAll('*[data-oracle-option-id]');

                var oracleOptions = Object.create(null);

                Array.from(oracleOptionElements).forEach(function(el){
                    var oracleOptionId = el.getAttribute('data-oracle-option-id');
                    var value;

                    var type = selectedOracle.options.find(function(opt){
                        return opt.id === oracleOptionId;
                    }).type;

                    switch(type){
                        case 'list':
                            value = cleanupURLs(el.value.split('\n'));
                            break;
                        case 'boolean':
                            value = el.checked;
                            break;
                        case 'date range':
                            value = {};
                            var fromInput = el.querySelector('input[name="from"]');
                            var from = fromInput.value;
                            if(from)
                                value.from = from;

                            var toInput = el.querySelector('input[name="to"]');
                            var to = toInput.value;
                            if(to)
                                value.to = to;

                            break;
                        case 'number':
                            value = Number(el.value);
                            break;
                        default:
                            // works for Array.isArray(type) (select/option)
                            value = el.value;       
                    }

                    oracleOptions[oracleOptionId] = value;
                });

                formData.oracle_options = JSON.stringify(oracleOptions);

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
                                    selectedOracleId: e.target.value
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

                    var defaultValue = queryOracleOptions[id];

                    if(selectedOracle.name === "Google Custom Search Engine" && opt.id === "lr" && !defaultValue){
                        defaultValue = 'lang_'+( (typeof navigator !== 'undefined' && navigator.language) || 'en');
                    }

                    if(Array.isArray(opt.type)){ // enum
                        input = React.DOM.select({
                            name: id,
                            "data-oracle-option-id": id,
                            defaultValue: defaultValue
                        }, opt.type.map(function(optOpt){
                            return React.DOM.option({
                                value: optOpt.value,
                                key: optOpt.value
                            }, optOpt.text)
                        }));
                    }
                    else{
                        switch(opt.type){
                            case 'list':
                                input = React.DOM.textarea({
                                    "data-oracle-option-id": id,
                                    name: id,
                                    defaultValue: (queryOracleOptions[id] || []).join('\n'),
                                    rows: 5
                                })
                                break;
                            case 'boolean':
                                input = React.DOM.input({
                                    "data-oracle-option-id": id,
                                    name: id,
                                    defaultChecked: queryOracleOptions[id],
                                    type: 'checkbox'
                                });
                                break;
                            case 'number':
                                input = React.DOM.input({
                                    "data-oracle-option-id": id,
                                    name: id,
                                    defaultValue: queryOracleOptions[id] || opt.default,
                                    min: opt.min,
                                    max: opt.max,
                                    step: opt.step,
                                    type: 'number'
                                });
                                break;
                            case 'date range':
                                input = React.DOM.div(
                                    {
                                        "data-oracle-option-id": id,
                                        className: 'date-range-input'
                                    },
                                    React.DOM.input({
                                        name: 'from',
                                        defaultValue: (queryOracleOptions[id] || {}).from ||
                                            moment().subtract(2, 'years').format('YYYY-MM-DD'),
                                        placeholder: 'YYYY-MM-DD',
                                        type: 'date'
                                    }),
                                    React.DOM.input({
                                        name: 'to',
                                        defaultValue: (queryOracleOptions[id] || {}).to || 
                                            moment().format('YYYY-MM-DD'),
                                        placeholder: 'YYYY-MM-DD',
                                        type: 'date'
                                    })
                                );
                                break;
                            default:
                                console.error('unknown oracle option type', opt.type, selectedOracle.name, opt.name, opt.id);
                        }
                    }

                    return React.DOM.label({}, 
                        React.DOM.span({}, opt.name),
                        input
                    );
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
        }) : undefined*/
        
        return query && query.name ?
            React.DOM.form({className: "sectionBodyTerritoriesQuerysLineForm"}, 
                React.DOM.div({className: 'sectionBodyTerritoriesQuerysLineSubTitle'}, query.name),
                territoireFormQuery
            ) :
            territoireFormQuery
    }
});
