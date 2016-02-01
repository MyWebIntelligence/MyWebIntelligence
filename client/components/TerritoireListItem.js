"use strict";

var ImmutableSet = require('immutable').Set;
var React = require('react');

var QueryForm = React.createFactory(require('./QueryForm'));
//var TerritoireForm = React.createFactory(require('./TerritoireForm'));

/*
interface TerritoireListItemProps{
    territoire?: MyWITerritoire
    oracles: MyWIOracle[]
    onTerritoireChange : (t: MyWITerritoire) => void
    deleteTerritoire: (t: MyWITerritoire) => void
    
    createQueryInTerritoire: (q: MyWIQueryData, t: MyWITerritoire) => void
    removeQueryFromTerritoire: (q: MyWIQueryData, t: MyWITerritoire) => void
    onQueryChange: (q: MyWIQueryData) => void
}

*/

module.exports = React.createClass({
    displayName: 'TerritoireListItem',
    
    getInitialState: function(){
        return {
            openQueryForms: new ImmutableSet(),
            showQueries: false
        };
    },
    
    render: function(){
        var props = this.props;
        var state = this.state;
        var self = this;
        
        var territoire = props.territoire;
    
        /*var children;
        
        if(state.editMode){
            children = [ new TerritoireForm({
                territoire: t,
                initialCreation: false,
                oracles: props.oracles,
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
                React.DOM.header({}, 
                    React.DOM.a(
                        {
                            href: "/territoire/"+t.id
                        },
                        React.DOM.h1({className: "name"}, t.name),
                        React.DOM.p({className: "description"}, t.description)
                    ),
                    React.DOM.a(
                        {
                            title: 'Export',
                            className: 'export',
                            href: "/territoire/export/"+t.id
                        }, 
                        React.DOM.i({className: 'fa fa-download '}, '')
                    ),
                    React.DOM.button(
                        {
                            className: 'edit',
                            onClick: function(){
                                self.setState({
                                    openQueryForms: state.openQueryForms,
                                    editMode: true
                                })
                            }
                        }, 
                        React.DOM.i({className: 'fa fa-pencil '}, '')
                    )   
                ),
                
                React.DOM.ul({className: "queries"}, t.queries.map(function(q){
                    return React.DOM.li(
                        {
                            className: state.openQueryForms.has(q.id) ? 'open' : ''
                        },
                        state.openQueryForms.has(q.id) ?
                            new QueryForm({
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
                            React.DOM.button(
                                {
                                    onClick: function(){
                                        if(state.openQueryForms.has(q.id))
                                            state.openQueryForms.delete(q.id);
                                        else
                                            state.openQueryForms.add(q.id);

                                        self.setState({
                                            openQueryForms: state.openQueryForms,
                                            editMode: false
                                        });
                                    }
                                },
                                React.DOM.strong({}, q.name),
                                React.DOM.span({}, props.oracles.find(function(o){
                                    return o.id === q.oracle_id;
                                }).name),
                                React.DOM.span({}, '"'+q.q+'"')
                            )
                    );
                }).concat([
                    React.DOM.li({
                        className: ['add', (state.openQueryForms.has('+') ? 'open' : '')].join(' ')
                    }, [
                        React.DOM.button({
                            onClick: function(){
                                if(state.openQueryForms.has('+'))
                                    state.openQueryForms.delete('+');
                                else
                                    state.openQueryForms.add('+');

                                self.setState({openQueryForms: state.openQueryForms});
                            }
                        }, '+'),
                        state.openQueryForms.has('+') ? new QueryForm({
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
        }*/
        
        
        
        return React.DOM.div({className: 'sectionBodyTerritories'},
            React.DOM.div({className: 'sectionBodyTerritoriesLabel'},
                React.DOM.div({className: 'sectionBodyTerritoriesLabelLogo'},
                    React.DOM.img({src: '/images/oneTerritory.png'})             
                ),
                React.DOM.div({className: 'sectionBodyTerritoriesLabelTitle'}, territoire.name),
                React.DOM.div({className: 'clear'})
            ),
            React.DOM.div({className: 'sectionBodyTerritoriesInfos'},
                React.DOM.div({className: 'sectionBodyTerritoriesInfos2'}, 'X - Y - Z'),
                React.DOM.div({className: 'sectionBodyTerritoriesInfos1'}, 'XX'),
                React.DOM.div({className: 'sectionBodyTerritoriesInfosLogo'},
                    React.DOM.img({src: '/images/oneTerritoryCount.png'})             
                ),
                React.DOM.div({className: 'clear'})
            ),
            React.DOM.div({className: 'clear'}),
            React.DOM.div({className:'sectionBodyTerritoriesButtons'},
                React.DOM.div({className: 'sectionBodyTerritoriesButtonsButton sectionBodyTerritoriesButtonsButtonResult'}, 'Result'),
                React.DOM.div(
                    {
                        className: [
                            'sectionBodyTerritoriesButtonsButton', 
                            'sectionBodyTerritoriesButtonsButtonQuery',
                            territoire.queries.length === 0 ? 'no' : ''
                        ].join(' ').trim(),
                        onClick: function(){
                            self.setState(Object.assign(
                                {},
                                state,
                                {
                                    showQueries: !state.showQueries
                                }
                            ))
                        }
                    }, territoire.queries.length === 0 ? 'No query' : 'Queries'),
                React.DOM.div({className: 'sectionBodyTerritoriesButtonsButton sectionBodyTerritoriesButtonsButtonExport'}, 'Export'),
                //React.DOM.div({className: 'sectionBodyTerritoriesButtonsButton sectionBodyTerritoriesButtonsButtonImport'}, 'Import'),
                React.DOM.div({className: 'sectionBodyTerritoriesButtonsButton sectionBodyTerritoriesButtonsButtonDownload'},
                    'Download'+' ',
                    React.DOM.i({className: 'fa fa-caret-down'})
                ),
                React.DOM.div({className: 'clear'})
            ),
            React.DOM.div({className: 'sectionBodyTerritoriesQuerys', hidden: !state.showQueries},
                React.DOM.div({className: 'sectionBodyTerritoriesQuerysNew'}, 'New query'),
                territoire.queries.map(function(q){
                    return React.DOM.div(
                        {
                            className: 'sectionBodyTerritoriesQuerysLine'
                        },
                        React.DOM.div(
                            {
                                className: 'sectionBodyTerritoriesQuerysLineTitle',
                                onClick: function(){                                
                                    var openQueryForms = state.openQueryForms;
                                    var id = q.id;

                                    self.setState(Object.assign(
                                        {},
                                        state,
                                        {
                                            openQueryForms : openQueryForms.has(id) ?
                                                openQueryForms.delete(id) :
                                                openQueryForms.add(id)
                                        }

                                    ))
                                }
                            },
                            React.DOM.div({className: 'sectionBodyTerritoriesQuerysLineTitle'}, q.name),
                            React.DOM.div({className: 'sectionBodyTerritoriesQuerysLineTitle'},
                                React.DOM.img({src: '/images/territoryTitle.png'})             
                            )          
                        ),
                        
                        state.openQueryForms.has(q.id) ?
                            new QueryForm({
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
                                        props.onQueryChange(deltaQuery, territoire);
                                    }

                                    // close the form UI in all cases
                                    state.openQueryForms.delete(q.id);
                                    self.setState({
                                        openQueryForms: state.openQueryForms,
                                        editMode: false
                                    });
                                },
                                deleteQuery: function(query){
                                    props.removeQueryFromTerritoire(query, territoire);
                                }
                            }) : undefined
                    )}
                )         
            )
        )
    }
});
