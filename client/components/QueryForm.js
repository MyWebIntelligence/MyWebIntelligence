"use strict";

var React = require('react');

function makeFormInput(name, tagName, type, placeholder){
    return React.DOM.label({}, [
        name,
        React.DOM[tagName]({
            type: type,
            placeholder: placeholder
        })
    ]);
}

//throw 'TODO add close button as well as confirm/ok button';
// add props.onSubmit

module.exports = React.createClass({
    getInitialState: function(){
        return {};
    },
    
    render: function(){
        var props = this.props;
        var state = this.state;
        var self = this;
        
        return React.DOM.form({
            onSubmit: function(e){
                e.preventDefault();
                
                throw 'TODO verify at least one value is different from props before calling props.onSubmit()';
            }
        }, [
            React.DOM.label({}, [
                'name',
                React.DOM.input({
                    type: 'text'
                })
            ]),
            React.DOM.label({}, [
                'query string',
                React.DOM.input({
                    type: 'text'
                })
            ]),
            React.DOM.label({}, [
                'language',
                React.DOM.select({}, [
                    React.DOM.option({}, 'unimportant'),
                    React.DOM.option({}, 'english'),
                    React.DOM.option({}, 'french')
                ])
            ]),
            React.DOM.label({}, [
                'goal number pages',
                React.DOM.input({
                    type: 'number',
                    min: 0,
                    step: 50,
                    value: 400
                })
            ]),
            React.DOM.label({}, [
                'oracle',
                React.DOM.select({}, [
                    React.DOM.option({}, 'Google search'),
                    React.DOM.option({}, 'Twitter search')
                ])
            ]),
            React.DOM.button({
                type: "submit"
            }, "ok")
        ]);
    }
});