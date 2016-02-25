"use strict";

var ImmutableSet = require('immutable').Set;
var React = require('react');

var QueryForm = React.createFactory(require('./QueryForm'));
var DeleteButton = React.createFactory(require('./DeleteButton'));


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
            openQueries: new ImmutableSet(),
            showQueries: false,
            newQueryFormOpen: false
        };
    },
    
    render: function(){
        var props = this.props;
        var state = this.state;
        var self = this;
        
        var territoire = props.territoire;
        
        return React.DOM.div({className: 'sectionBodyTerritories'},
            React.DOM.header({},
                React.DOM.div({className: 'top-line'},
                    React.DOM.div({className: 'sectionBodyTerritoriesLabel'},
                        React.DOM.div({className: 'sectionBodyTerritoriesLabelLogo'},
                            React.DOM.img({src: '/images/oneTerritory.png'})             
                        ),
                        React.DOM.div({className: 'sectionBodyTerritoriesLabelTitle'}, territoire.name)
                    ),
                    React.DOM.div({className: 'sectionBodyTerritoriesInfos'},
                        /*React.DOM.div({className: 'sectionBodyTerritoriesInfosLogo'},
                            React.DOM.img({src: '/images/oneTerritoryCount.png'})             
                        ),*/
                        new DeleteButton({
                            className: 'delete-territoire',
                            onDelete: function(){
                                props.deleteTerritoire(territoire);
                            }
                        })
                    )
                ),
                territoire.description ? React.DOM.p({className: 'description'}, territoire.description): undefined              
            ),
            React.DOM.div({className:'sectionBodyTerritoriesButtons'},
                React.DOM.a(
                    {
                        href: '/territoire/'+territoire.id,
                        className: 'sectionBodyTerritoriesButtonsButton sectionBodyTerritoriesButtonsButtonResult'
                    },
                    'Result'
                ),
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
                                { showQueries: !state.showQueries }
                            ))
                        }
                    }, territoire.queries.length === 0 ? 'No query' : 'Queries'),
                React.DOM.a(
                    {
                        href: "/territoire/export/"+territoire.id,
                        className: 'sectionBodyTerritoriesButtonsButton sectionBodyTerritoriesButtonsButtonExport'
                    },
                    'Export'
                ),
                React.DOM.div({className: 'clear'})
            ),
            React.DOM.div({className: 'sectionBodyTerritoriesQuerys', hidden: !state.showQueries},
                React.DOM.button(
                    {
                        className: 'sectionBodyTerritoriesQuerysNew',
                        onClick: function(){
                            self.setState(Object.assign(
                                {},
                                state,
                                { newQueryFormOpen: !state.newQueryFormOpen }
                            )); 
                        }
                    },
                    'New query'
                ),
                state.newQueryFormOpen ?
                    new QueryForm(
                        {
                            oracles: props.oracles, 
                            onSubmit: function(queryData){
                                props.createQueryInTerritoire(queryData, territoire);
                                self.setState(Object.assign(
                                    {},
                                    state,
                                    { newQueryFormOpen: false }
                                )); 
                            }
                        }
                    ) : undefined,
                territoire.queries.map(function(q){
                    return React.DOM.div(
                        {
                            className: 'sectionBodyTerritoriesQuerysLine'
                        },
                        React.DOM.header(
                            {
                                className: 'sectionBodyTerritoriesQuerysLineTitle',
                                onClick: function(){                                
                                    var openQueries = state.openQueries;
                                    var id = q.id;

                                    self.setState(Object.assign(
                                        {},
                                        state,
                                        {
                                            openQueries : openQueries.has(id) ?
                                                openQueries.delete(id) :
                                                openQueries.add(id)
                                        }

                                    ))
                                }
                            },
                            React.DOM.div({className: 'sectionBodyTerritoriesQuerysLineTitle'}, q.name),
                            React.DOM.div({className: 'sectionBodyTerritoriesQuerysLineTitle'},
                                React.DOM.img({src: '/images/territoryTitle.png'})             
                            ),
                            new DeleteButton({
                                className: 'delete-query',
                                onDelete: function(){
                                    props.removeQueryFromTerritoire(q, territoire);
                                }
                            })
                        ),
                        
                        state.openQueries.has(q.id) ?
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
                                    state.openQueries.delete(q.id);
                                    self.setState({
                                        openQueries: state.openQueries,
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
