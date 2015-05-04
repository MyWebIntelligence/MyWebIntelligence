"use strict";

var React = require('react');

var Header = require('./Header');
var TerritoiresList = React.createFactory(require('./TerritoiresList'));

/*

interface TerritoiresListScreenProps{
    user: MyWIUser
    serverAPI: MyWIServerAPI,
}

*/


module.exports = React.createClass({
    getInitialState: function() {
        console.log('TerritoiresListScreen', 'getInitialState', this.props);
        return {
            user: this.props.user
        }
    },
    
    render: function() {
        var self = this;
        var props = this.props;
        var state = this.state;

        var mainChildren = [
            React.DOM.h1({}, "Territoires"),
            new TerritoiresList({
                territoires: state.user.territoires,
                oracles: props.oracles,
                onTerritoireListChange: function(newTerritoireList){
                    state.user.territoires = newTerritoireList;
                    self.setState({
                        user: state.user
                    })
                },
                createTerritoire: function(territoireData){
                    var temporaryTerritoire = Object.assign({queries: []}, territoireData);

                    // add at the beginning of the array so it appears first
                    state.user.territoires.unshift(temporaryTerritoire);

                    // some element of the state.user.territoires array was mutated
                    self.setState({
                        user: state.user
                    });

                    props.serverAPI.createTerritoire(territoireData).then(function(serverTerritoire){
                        var index = state.user.territoires.findIndex(function(t){
                            return t === temporaryTerritoire;
                        });

                        serverTerritoire.queries = [];
                        state.user.territoires[index] = serverTerritoire;

                        // some element of the state.user.territoires array was mutated
                        self.setState({
                            user: state.user
                        });

                    }).catch(function(err){
                        console.error('TODO add error message to UI '+err);

                        /*var index = state.user.territoires.findIndex(function(t){
                            return t === territoire;
                        });

                        state.user.territoires.unshift(index, 1);

                        // some element of the state.user.territoires array was mutated
                        self.setState({
                            user: state.user,
                            currentTerritoire: state.currentTerritoire
                        });*/
                    });

                },
                onTerritoireChange: function(territoireDelta){
                    var relevantTerritoireIndex = state.user.territoires.findIndex(function(t){
                        return t.id === territoireDelta.id;
                    });

                    var temporaryTerritoire = Object.assign(
                        {},          
                        state.user.territoires[relevantTerritoireIndex],
                        territoireDelta
                    );

                    state.user.territoires[relevantTerritoireIndex] = temporaryTerritoire;

                    // some element of the state.user.territoires array was mutated
                    self.setState({
                        user: state.user
                    });

                    props.serverAPI.updateTerritoire(territoireDelta).then(function(updatedTerritoire){
                        console.log('update of', territoireDelta, 'went well', updatedTerritoire);

                        var newRelevantTerritoireIndex = state.user.territoires.findIndex(function(t){
                            return t.id === territoireDelta.id;
                        });

                        state.user.territoires[newRelevantTerritoireIndex] = Object.assign(temporaryTerritoire, updatedTerritoire);

                        self.setState({
                            user: state.user
                        });
                    }).catch(function(err){
                        console.error('TODO add error message to UI '+err);
                    });
                },
                deleteTerritoire: function(t){
                    var index = state.user.territoires.indexOf(t);
                    state.user.territoires.splice(index, 1);

                    // some element of the state.user.territoires array was mutated
                    self.setState({
                        user: state.user
                    });

                    props.serverAPI.deleteTerritoire(t).then(function(){
                        self.setState({
                            user: state.user
                        });
                    });// .catch() // TODO add back + error message
                },
                createQueryInTerritoire: function(queryData, territoire){
                    var temporaryQuery = Object.assign({}, queryData);

                    territoire.queries.push(temporaryQuery);
                    // some element of the state.user.territoires array was mutated
                    self.setState({
                        user: state.user
                    });

                    props.serverAPI.createQueryInTerritoire(queryData, territoire).then(function(serverQuery){
                        var index = territoire.queries.findIndex(function(q){
                            return q === temporaryQuery;
                        });
                        territoire.queries[index] = serverQuery;

                        self.setState({
                            user: state.user
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

                    // some element of the state.user.territoires array was mutated
                    self.setState({
                        user: state.user
                    });

                    props.serverAPI.updateQuery(queryDelta).then(function(updatedQuery){
                        console.log('update of', queryDelta, 'went well', updatedQuery);

                        var newRelevantQueryIndex = territoire.queries.findIndex(function(q){
                            return q.id === queryDelta.id;
                        });

                        territoire.queries[newRelevantQueryIndex] = Object.assign(temporaryQuery, updatedQuery);

                        self.setState({
                            user: state.user
                        });
                    }).catch(function(err){
                        console.error('TODO add error message to UI '+err);
                    });
                },
                removeQueryFromTerritoire: function(query, territoire){
                    var index = territoire.queries.indexOf(query);
                    territoire.queries.splice(index, 1);

                    // some element of the state.user.territoires array was mutated
                    self.setState({
                        user: state.user
                    });

                    props.serverAPI.deleteQuery(query).then(function(){
                        self.setState({
                            user: state.user
                        });
                    });// .catch() // TODO add back + error message
                }
            })
        ];
        
        
        return React.DOM.div({className: "react-wrapper"}, [
            
            new Header({
                user: state.user,
                oracleHref: "/oracles"
            }),
            
            React.DOM.main({className: 'territoire-list'}, mainChildren)
        
        ]);
    }
});
