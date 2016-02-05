'use strict';

var React = require('react');
    
/*
    interface SelectFilterProps{
        label: string
        className: string,
        value: string,
        options: string[],
        onChange: (newValue: string) => void
    }
*/

module.exports = React.createClass({
    displayName: "SelectFilter",
    
    render: function(){
        var props = this.props;
                
        return React.DOM.div(
            {
                className: [props.className || '', 'filter'].join(' ').trim()
            },
            React.DOM.label(
                {},
                props.label ? props.label : undefined,
                React.DOM.select(
                    {
                        onChange: function(e){
                            var value = e.target.value;

                            props.onChange(value);
                        }
                    },
                    Object.keys(props.options).map(function(key){
                        var value = props.options[key];
                        
                        return React.DOM.option({value: value, key: value}, key)
                    })
                )
            )
        )
    }
});
