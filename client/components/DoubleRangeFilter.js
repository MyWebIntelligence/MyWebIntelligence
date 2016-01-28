"use strict";

var React = require('react');
    
/*
    interface DoubleRangeFilterProps{
        min: number,
        max: number,
        step: number,
        numberToLabelString: (value: number) => string,
        defaultValue: {max: number, min: number}
        onChange: (min, max) => void
    }

    interface DoubleRangeFilterState{
        min: number,
        max: number
    }

*/

module.exports = React.createClass({
    displayName: "DoubleRangeFilter",
    
    componentDidMount: function(){
        // find double-range width in px
        // find granularity with step (min 1px)
        // 
        
        
    },
    
    getInitialState: function(){
        var props = this.props;
        
        return {
            min: props.defaultValue.min,
            max: props.defaultValue.max
        };
    },
    
    render: function(){
        //var props = this.props;
        
        
        
        return React.DOM.div(
            {
                className: ['double-range', 'filter'].join(' ').trim()
            },
            React.DOM.hr({ className: 'guide' }),
            React.DOM.label({}),
            React.DOM.hr({ className: 'selected-portion' }),
            React.DOM.div({
                className: ['handle', 'left'].join(' ').trim(),
                onMouseMove: function(){
                    // compute distance relative to left and right of .double-range
                    // cap at min and max
                    // choose the value that is closest to one of the step values
                }
            }),
            React.DOM.div({ className: ['handle', 'right'].join(' ').trim() })
        )
    }
});
