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
                props.label,
                React.DOM.select(
                    {
                        onChange: function(e){
                            var value = e.target.value;

                            props.onChange(value);
                        }
                    },
                    props.options.map(function(opt){
                        return React.DOM.option({value: opt}, opt)
                    })
                )
            )
        )
    }
});
