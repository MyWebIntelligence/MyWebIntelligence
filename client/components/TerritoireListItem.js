"use strict";

var React = require('react');

var QueryForm = require('./QueryForm');
var TerritoireForm = require('./TerritoireForm');


/*
interface TerritoireListItemProps{
    territoire: MyWITerritoire
    onTerritoireChange : (t: MyWITerritoire) => void
    createQuery: (q: MyWIQueryData) => void
}

*/

module.exports = React.createClass({
    getInitialState: function(){
        return {
            openQueryForms: new Set(),
            editMode: false
        };
    },
    
    render: function(){
        var props = this.props;
        var state = this.state;
        var self = this;
        
        var t = props.territoire;
        
        var children;
        
        if(state.editMode){
            children = [ TerritoireForm({
                territoire: t,
                onSubmit: function(formData){
                    var keysWithChange = Object.keys(formData).filter(function(k){
                        return t[k] !== formData[k];
                    });
                    
                    if(keysWithChange.length >= 1){
                        keysWithChange.forEach(function(k){
                            t[k] = formData[k];
                        });

                        // new territoire is the current one mutated at the .queries array level
                        props.onTerritoireChange(t);
                        
                        self.setState({
                            openQueryForms: state.openQueryForms,
                            editMode: false
                        });
                    }
                }
            }) ];
        }
        else{
            children = [
                React.DOM.a({
                    href: "TODO",
                    onClick: function(e){
                        e.preventDefault();
                    }
                }, [
                    React.DOM.h1({}, t.name),
                    React.DOM.p({className: "description"}, t.description),
                ]),
                React.DOM.button({
                    className: 'edit',
                    onClick: function(){
                        self.setState({
                            openQueryForms: state.openQueryForms,
                            editMode: true
                        })
                    }
                }, React.DOM.i({className: 'fa fa-pencil '}, '')),
                React.DOM.span({
                    style: {
                        display: "inline"
                    }
                }, "Queries: "),
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

                                self.setState({
                                    openQueryForms: state.openQueryForms,
                                    editMode: false
                                });
                            }
                        }, q.name),
                        state.openQueryForms.has(q.id) ? QueryForm({
                            query: q,
                            onSubmit: function(formData){
                                var keysWithChange = Object.keys(formData).filter(function(k){
                                    return q[k] !== formData[k];
                                });

                                if(keysWithChange.length >= 1){
                                    keysWithChange.forEach(function(k){
                                        q[k] = formData[k];
                                    });

                                    // new territoire is the current one mutated at the .queries array level
                                    props.onTerritoireChange(t);
                                }

                                // close the form UI in all cases
                                state.openQueryForms.delete(q.id);
                                self.setState({
                                    openQueryForms: state.openQueryForms,
                                    editMode: false
                                });
                            }
                        }) : undefined
                    ]);
                }).concat([
                    React.DOM.li({
                        className: 'add' + (state.openQueryForms.has('+') ? ' open' : '')
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
                            onSubmit: function(formData){
                                props.createQuery(formData);

                                // close the form UI in all cases
                                state.openQueryForms.delete('+');
                                self.setState({openQueryForms: state.openQueryForms});
                            }
                        }) : undefined
                    ])
                ]))
            ]
        }
        
        
        
        return React.DOM.li({}, children);
    }
});
