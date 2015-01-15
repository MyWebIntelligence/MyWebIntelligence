"use strict";

var React = require('react');

module.exports = React.createClass({
    getInitialState: function(){
        return {};
    },
    
    render: function(){
        var data = this.props;
        var state = this.state;
        var self = this;
        
        return React.DOM.form({
            className: "simple-start",
            onSubmit: function(e){
                e.preventDefault();
                console.log('submit', new FormData(e.target));
            }
        }, [
            React.DOM.label({htmlFor: "query"}, [
                'keywords ',
                React.DOM.input({id: "query", name: "query"}),
                React.DOM.button({type: "submit"}, "GO !")
            ])
        ]);
    }
});