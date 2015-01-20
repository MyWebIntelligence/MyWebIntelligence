"use strict";

var React = require('react');

var LoginBox = React.createFactory(require('./LoginBox'));
var TerritoiresList = React.createFactory(require('./TerritoiresList'));


if(!Object.assign){
    throw 'add Object.assign polyfill';
}


/*

interface MyWIUserId extends Number{ __MyWIUserId: MyWIUserId }

interface MyWIUser{
    id: MyWIUserId
    username: string
    pictureURL: string
    territoires : MyWITerritoire[]
}

interface MyWITerritoireId extends Number{ __MyWITerritoireId: MyWITerritoireId }

interface MyWITerritoire{
    id: MyWITerritoireId
    name: string
    description: string 
    queries: MyWIQuery[]
}

interface MyWIQueryId extends Number{ __MyWIQueryId: MyWIQueryId }

interface MyWIQuery{
    id: MyWIQueryId,
    name: string
    q: string
    lang: string // enum
    nbPage: number // still not convinced of this one.
    oracle: MyWIOracleId
}

interface MyWIOracleId extends Number{ __MyWIOracleId: MyWIOracleId }


interface AppProps{
    currentUser: MyWIUser
    currentTerritoire: MyWITerritoire
    serverAPI: MyWIServerAPI
}


*/

module.exports = React.createClass({
    getInitialState: function() {
        return {
            currentUser: this.props.currentUser,
            currentTerritoire: this.props.currentTerritoire
        }
    },
    
    render: function() {
        var self = this;
        var props = this.props;
        var state = this.state;
        
        var headerChildren = [
            React.DOM.span({}, "My Web Intelligence")
        ];

        var mainChildren = [];
        var mainClassName;
        
        if(state.currentUser){
            
            if(state.currentTerritoire){
                throw 'TODO';
            }
            else{
                mainChildren.push(TerritoiresList({
                    territoires: state.currentUser.territoires,
                    onTerritoireListChange: function(newTerritoireList){
                        state.currentUser.territoires = newTerritoireList;
                        self.setState({
                            currentUser: state.currentUser,
                            currentTerritoire: state.currentTerritoire
                        })
                    },
                    createTerritoire: function(territoireData){
                        var temporaryTerritoire = Object.assign({queries: []}, territoireData);
                        
                        // add at the beginning of the array so it appears first
                        state.currentUser.territoires.unshift(temporaryTerritoire);
                        
                        // some element of the state.currentUser.territoires array was mutated
                        self.setState({
                            currentUser: state.currentUser,
                            currentTerritoire: state.currentTerritoire
                        });
                        
                        props.serverAPI.createTerritoire(territoireData).then(function(serverTerritoire){
                            var index = state.currentUser.territoires.findIndex(function(t){
                                return t === temporaryTerritoire;
                            });
                            
                            serverTerritoire.queries = [];
                            state.currentUser.territoires[index] = serverTerritoire;
                            
                            // some element of the state.currentUser.territoires array was mutated
                            self.setState({
                                currentUser: state.currentUser,
                                currentTerritoire: state.currentTerritoire
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
                            currentUser: state.currentUser,
                            currentTerritoire: state.currentTerritoire
                        });
                        
                        props.serverAPI.updateTerritoire(territoireDelta).then(function(updatedTerritoire){
                            console.log('update of', territoireDelta, 'went well', updatedTerritoire);
                            
                            var relevantTerritoireIndex = state.currentUser.territoires.findIndex(function(t){
                                return t.id === territoireDelta.id;
                            });
                            
                            state.currentUser.territoires[relevantTerritoireIndex] = Object.assign(temporaryTerritoire, updatedTerritoire);
                            
                            self.setState({
                                currentUser: state.currentUser,
                                currentTerritoire: state.currentTerritoire
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
                            currentUser: state.currentUser,
                            currentTerritoire: state.currentTerritoire
                        });
                        
                        props.serverAPI.deleteTerritoire(t).then(function(){
                            self.setState({
                                currentUser: state.currentUser,
                                currentTerritoire: state.currentTerritoire
                            });
                        });// .catch() // TODO
                    },
                    createQuery: function(queryData, territoire){
                        var query = Object.assign({}, queryData, {id: nextMyWIQueryId++});
                        
                        territoire.queries.push(query);
                        // some element of the state.currentUser.territoires array was mutated
                        self.setState({
                            currentUser: state.currentUser,
                            currentTerritoire: state.currentTerritoire
                        });
                    },
                    removeQueryFromTerritoire: function(query, territoire){
                        var index = territoire.queries.indexOf(query);
                        territoire.queries.splice(index, 1);
                        
                        // some element of the state.currentUser.territoires array was mutated
                        self.setState({
                            currentUser: state.currentUser,
                            currentTerritoire: state.currentTerritoire
                        });
                    }
                }));
            }
            
            
            headerChildren.push(React.DOM.div({className: "user-infos"}, [
                React.DOM.img({className:"avatar", src: state.currentUser.pictureURL}),
                React.DOM.span({className:"username"}, state.currentUser.username)
            ]));
        }
        else{
            mainChildren.push(LoginBox({
                onLogin: function(){
                    self.setState({
                        currentUser: loggedInUserStub,
                        currentTerritoire: undefined
                    });
                }
            }));
            
            mainClassName = "login";
        }
        
        
        
        
        
        return React.DOM.div({className: "react-wrapper"}, [
            
            React.DOM.header({}, headerChildren),
            
            React.DOM.main({className: mainClassName}, mainChildren)
        
        ]);
    }
});