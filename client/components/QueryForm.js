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
        return {};
    },
    
    render: function(){
        var props = this.props;
        var state = this.state;
        var self = this;
        
        var query = props.query || {};
        
        return React.DOM.div({className:"QueryForm-react-component"}, [
            React.DOM.form({
                className: "table-layout query",
                onSubmit: function(e){
                    e.preventDefault();

                    var formElement = e.target;

                    var formData = Object.create(null);
                    formData.name = formElement.querySelector('input[name="name"]').value.trim();
                    formData.q = formElement.querySelector('input[name="q"]').value;
                    formData.lang = formElement.querySelector('select[name="lang"]').value;
                    formData.nbPage = Number( formElement.querySelector('input[name="nbPage"]').value );
                    formData.oracle_id = Number( formElement.querySelector('select[name="oracle_id"]').value );

                    props.onSubmit(formData);
                }
            }, [
                React.DOM.label({}, [
                    React.DOM.span({}, 'name'),
                    React.DOM.input({
                        name: 'name',
                        type: 'text',
                        required: true,
                        /*
                            https://github.com/facebook/react/issues/2860
                            Giving up for now
                        */
                        //pattern: '\s*(\S+\s*)+', 

                        // browsers auto-complete based on @name and here it's "name" which is common
                        // so autocompletion values aren't that useful. This isn't very autocompletable anyway
                        autoComplete: 'off', 
                        defaultValue: query.name
                    })
                ]),
                React.DOM.label({}, [
                    React.DOM.span({}, 'query string'),
                    React.DOM.input({
                        name: 'q',
                        required: true,
                        type: 'text',
                        defaultValue: query.q
                    })
                ]),
                React.DOM.label({}, [
                    React.DOM.span({}, 'language'),
                    React.DOM.select({
                        name: 'lang',
                        defaultValue: query.lang || "none"
                    }, [
                        React.DOM.option({value: "none"}, 'unimportant'),
                        React.DOM.option({value: "en"}, 'english'),
                        React.DOM.option({value: "fr"}, 'french')
                    ])
                ]),
                React.DOM.label({}, [
                    React.DOM.span({}, 'goal number pages'),
                    React.DOM.input({
                        name: 'nbPage',
                        type: 'number',
                        min: 0,
                        step: 50,
                        defaultValue: 'nbPage' in query ? query.nbPage : 400
                    })
                ]),
                React.DOM.label({}, [
                    React.DOM.span({}, 'oracle'),
                    React.DOM.select({
                        name: 'oracle_id',
                        defaultValue: query.oracle_id
                    }, props.oracles.map(function(o){
                        return React.DOM.option({
                            value: o.id,
                        }, o.name)
                    }))
                ]),
                React.DOM.button({
                    type: "submit"
                }, "ok")
            ]),
            props.query ? DeleteButton({
                onDelete: function(){
                    props.deleteQuery(props.query);
                }
            }) : undefined
        ]);
    }
});