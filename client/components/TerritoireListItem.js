"use strict";

var React = require('react');

var QueryForm = require('./QueryForm');

module.exports = React.createClass({
    getInitialState: function(){
        return { openQueryForms: new Set() };
    },
    
    render: function(){
        var props = this.props;
        var state = this.state;
        var self = this;
        
        var t = props.territoire;
        
        return React.DOM.li({}, [
            React.DOM.a({
                href: "TODO",
                onClick: function(e){
                    e.preventDefault();
                }
            }, [
                React.DOM.div({className: "name"}, t.name),
                React.DOM.div({className: "description"}, t.description),
            ]),
            React.DOM.ul({className: "queries"}, t.queries.map(function(q){
                return React.DOM.li({
                    className: state.openQueryForms.has(q.id) ? 'open' : ''
                }, [
                    React.DOM.button({
                        onClick: function(e){
                            if(state.openQueryForms.has(q.id))
                                state.openQueryForms.delete(q.id);
                            else
                                state.openQueryForms.add(q.id);

                            self.setState({openQueryForms: state.openQueryForms});
                        }
                    }, q.name),
                    state.openQueryForms.has(q.id) ? QueryForm({
                        query: q,
                        onSubmit: function(e){
                            throw 'TODO';
                        }
                    }) : undefined
                ]);
            }).concat([
                React.DOM.li({
                    className: state.openQueryForms.has('+') ? 'open' : ''
                }, [
                    React.DOM.button({
                        onClick: function(e){
                            if(state.openQueryForms.has('+'))
                                state.openQueryForms.delete('+');
                            else
                                state.openQueryForms.add('+');

                            self.setState({openQueryForms: state.openQueryForms});
                        }
                    }, '+'),
                    state.openQueryForms.has('+') ? QueryForm({
                        onSubmit: function(e){
                            throw 'TODO';
                        }
                    }) : undefined
                ])
            ]))
        ]);
    }
});
