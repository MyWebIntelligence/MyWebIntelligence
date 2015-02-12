"use strict";

var Set = require('es6-set');

var React = require('react');

var QueryForm = React.createFactory(require('./QueryForm'));
var TerritoireForm = React.createFactory(require('./TerritoireForm'));

/*
interface TerritoireListItemProps{
    territoire?: MyWITerritoire
    oracles: MyWIOracle[]
    onTerritoireChange : (t: MyWITerritoire) => void
    deleteTerritoire: (t: MyWITerritoire) => void
    moveToTerritoireViewScreen: (t: MyWITerritoire) => void
    
    createQueryInTerritoire: (q: MyWIQueryData, t: MyWITerritoire) => void
    removeQueryFromTerritoire: (q: MyWIQueryData, t: MyWITerritoire) => void
    onQueryChange: (q: MyWIQueryData) => void
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
                        var changedValues = {id: t.id};
                        
                        keysWithChange.forEach(function(k){
                            changedValues[k] = formData[k];
                        });

                        props.onTerritoireChange(changedValues);
                    }

                    self.setState({
                        openQueryForms: state.openQueryForms,
                        editMode: false
                    });
                },
                deleteTerritoire: function(){
                    props.deleteTerritoire(t);
                    self.setState({
                        openQueryForms: state.openQueryForms,
                        editMode: false
                    });
                }
            }) ];
        }
        else{
            children = [
                React.DOM.a({
                    href: "/territoire/"+t.id,
                    onClick: function(e){
                        e.preventDefault();
                        
                        props.moveToTerritoireViewScreen(t);
                    }
                }, [
                    React.DOM.h1({className: "name"}, t.name),
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
                React.DOM.ul({className: "queries"}, t.queries.map(function(q){
                    return React.DOM.li({
                        className: state.openQueryForms.has(q.id) ? 'open' : ''
                    }, [
                        state.openQueryForms.has(q.id) ?
                            QueryForm({
                                oracles: props.oracles,
                                query: q,
                                onSubmit: function(formData){
                                    var keysWithChange = Object.keys(formData).filter(function(k){
                                        return q[k] !== formData[k];
                                    });

                                    if(keysWithChange.length >= 1){
                                        var deltaQuery = {id: q.id};

                                        keysWithChange.forEach(function(k){
                                            deltaQuery[k] = formData[k];
                                        });

                                        // new territoire is the current one mutated at the .queries array level
                                        props.onQueryChange(deltaQuery, t);
                                    }

                                    // close the form UI in all cases
                                    state.openQueryForms.delete(q.id);
                                    self.setState({
                                        openQueryForms: state.openQueryForms,
                                        editMode: false
                                    });
                                },
                                deleteQuery: function(query){
                                    props.removeQueryFromTerritoire(query, t);
                                }
                            }) :
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
                            }, [
                                React.DOM.strong({}, q.name),
                                React.DOM.span({}, props.oracles.find(function(o){
                                    return o.id === q.oracle_id;
                                }).name),
                                React.DOM.span({}, '"'+q.q+'"'),
                                React.DOM.span({}, '0/'+q.nbPage)
                            ])
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
                            oracles: props.oracles,
                            onSubmit: function(formData){
                                props.createQueryInTerritoire(formData, t);

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
