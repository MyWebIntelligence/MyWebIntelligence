"use strict";

var React = require('react');

var Header = require('./Header');
var TerritoiresList = React.createFactory(require('./TerritoiresList'));

/*

interface TerritoiresListScreenProps{
    currentUser: MyWIUser
    serverAPI: MyWIServerAPI,
    moveToOraclesScreen: () => void
    moveToTerritoireViewScreen: (territoire: MyWITerritoire) => void
}

*/


module.exports = React.createClass({
    getInitialState: function() {
        return {
            currentUser: this.props.currentUser
        }
    },
    
    render: function() {
        var self = this;
        var props = this.props;
        var state = this.state;

        var mainChildren = [
            React.DOM.h1({}, "Territoires"),
            new TerritoiresList({
                territoires: state.currentUser.territoires,
                oracles: props.oracles,
                onTerritoireListChange: function(newTerritoireList){
                    state.currentUser.territoires = newTerritoireList;
                    self.setState({
                        currentUser: state.currentUser
                    })
                },
                createTerritoire: function(territoireData){
                    var temporaryTerritoire = Object.assign({queries: []}, territoireData);

                    // add at the beginning of the array so it appears first
                    state.currentUser.territoires.unshift(temporaryTerritoire);

                    // some element of the state.currentUser.territoires array was mutated
                    self.setState({
                        currentUser: state.currentUser
                    });

                    props.serverAPI.createTerritoire(territoireData).then(function(serverTerritoire){
                        var index = state.currentUser.territoires.findIndex(function(t){
                            return t === temporaryTerritoire;
                        });

                        serverTerritoire.queries = [];
                        state.currentUser.territoires[index] = serverTerritoire;

                        // some element of the state.currentUser.territoires array was mutated
                        self.setState({
                            currentUser: state.currentUser
                        });

                    }).catch(function(err){
                        console.error('TODO add error message to UI '+err);

                        /*var index = state.currentUser.territoires.findIndex(function(t){
                            return t === territoire;
                        });

                        state.currentUser.territoires.unshift(index, 1);

                        // some element of the state.currentUser.territoires array was mutated
                        self.setState({
                            currentUser: state.currentUser,
                            currentTerritoire: state.currentTerritoire
                        });*/
                    });

                },
                onTerritoireChange: function(territoireDelta){
                    var relevantTerritoireIndex = state.currentUser.territoires.findIndex(function(t){
                        return t.id === territoireDelta.id;
                    });

                    var temporaryTerritoire = Object.assign(
                        {},          
                        state.currentUser.territoires[relevantTerritoireIndex],
                        territoireDelta
                    );

                    state.currentUser.territoires[relevantTerritoireIndex] = temporaryTerritoire;

                    // some element of the state.currentUser.territoires array was mutated
                    self.setState({
                        currentUser: state.currentUser
                    });

                    props.serverAPI.updateTerritoire(territoireDelta).then(function(updatedTerritoire){
                        console.log('update of', territoireDelta, 'went well', updatedTerritoire);

                        var newRelevantTerritoireIndex = state.currentUser.territoires.findIndex(function(t){
                            return t.id === territoireDelta.id;
                        });

                        state.currentUser.territoires[newRelevantTerritoireIndex] = Object.assign(temporaryTerritoire, updatedTerritoire);

                        self.setState({
                            currentUser: state.currentUser
                        });
                    }).catch(function(err){
                        console.error('TODO add error message to UI '+err);
                    });
                },
                deleteTerritoire: function(t){
                    var index = state.currentUser.territoires.indexOf(t);
                    state.currentUser.territoires.splice(index, 1);

                    // some element of the state.currentUser.territoires array was mutated
                    self.setState({
                        currentUser: state.currentUser
                    });

                    props.serverAPI.deleteTerritoire(t).then(function(){
                        self.setState({
                            currentUser: state.currentUser
                        });
                    });// .catch() // TODO add back + error message
                },
                createQueryInTerritoire: function(queryData, territoire){
                    var temporaryQuery = Object.assign({}, queryData);

                    territoire.queries.push(temporaryQuery);
                    // some element of the state.currentUser.territoires array was mutated
                    self.setState({
                        currentUser: state.currentUser
                    });

                    props.serverAPI.createQueryInTerritoire(queryData, territoire).then(function(serverQuery){
                        var index = territoire.queries.findIndex(function(q){
                            return q === temporaryQuery;
                        });
                        territoire.queries[index] = serverQuery;

                        self.setState({
                            currentUser: state.currentUser
                        });

                    })// .catch() // TODO error message
                },
                onQueryChange: function(queryDelta, territoire){
                    var relevantQueryIndex = territoire.queries.findIndex(function(q){
                        return q.id === queryDelta.id;
                    });

                    var temporaryQuery = Object.assign(
                        {},          
                        territoire.queries[relevantQueryIndex],
                        queryDelta
                    );

                    territoire.queries[relevantQueryIndex] = temporaryQuery;

                    // some element of the state.currentUser.territoires array was mutated
                    self.setState({
                        currentUser: state.currentUser
                    });

                    props.serverAPI.updateQuery(queryDelta).then(function(updatedQuery){
                        console.log('update of', queryDelta, 'went well', updatedQuery);

                        var newRelevantQueryIndex = territoire.queries.findIndex(function(q){
                            return q.id === queryDelta.id;
                        });

                        territoire.queries[newRelevantQueryIndex] = Object.assign(temporaryQuery, updatedQuery);

                        self.setState({
                            currentUser: state.currentUser
                        });
                    }).catch(function(err){
                        console.error('TODO add error message to UI '+err);
                    });
                },
                removeQueryFromTerritoire: function(query, territoire){
                    var index = territoire.queries.indexOf(query);
                    territoire.queries.splice(index, 1);

                    // some element of the state.currentUser.territoires array was mutated
                    self.setState({
                        currentUser: state.currentUser
                    });

                    props.serverAPI.deleteQuery(query).then(function(){
                        self.setState({
                            currentUser: state.currentUser
                        });
                    });// .catch() // TODO add back + error message
                },
                moveToTerritoireViewScreen: props.moveToTerritoireViewScreen
            })
        ];
        
        
        return React.DOM.div({className: "react-wrapper"}, [
            
            new Header({
                user: state.currentUser,
                moveToOraclesScreen: props.moveToOracleScreen
            }),
            
            React.DOM.main({className: 'territoire-list'}, mainChildren)
        
        ]);
    }
});
