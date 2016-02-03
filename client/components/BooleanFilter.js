'use strict';

var React = require('react');
    
/*
    interface BooleanFilterProps{
        label: string
        className: string,
        value: string,
        onChange: (newValue: string) => void
    }

*/

module.exports = React.createClass({
    displayName: "BooleanFilter",
    
    render: function(){
        var props = this.props;
                        
        return React.DOM.div(
            {
                className: [
                    props.className || '', 
                    props.value ? 'active' : '',
                    'filter'
                ].join(' ').trim()
            },
            React.DOM.label(
                {},
                React.DOM.button({
                    onClick: function(){
                        props.onChange(!props.value);
                    }
                }, props.children)
            )
        )
    }
});
