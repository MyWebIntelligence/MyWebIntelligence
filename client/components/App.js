"use strict";

var React = require('react');

var LoginBox = require('./LoginBox');
var SimpleStart = require('./SimpleStart');
var TerritoiresList = require('./TerritoiresList');

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

*/


var loggedInUserStub = {
    id: 456,
    username: "Amar Lakel",
    pictureURL: "https://pbs.twimg.com/profile_images/486464993626308608/AH-pheJB.jpeg",
    territoires : [
        { 
            id: 83,
            name: "Twitter chocolatiers",
            description: "When separately written programs are composed so that they may cooperate, they may instead destructively interfere in unanticipated ways. These hazards limit the scale and functionality of the software systems we can successfully compose.",
            queries: [
                {
                    id: 36,
                    name: "chocolatier",
                    q: "chocolatier",
                    lang: "fr",
                    nbPage: 200, // still not convinced of this one.
                    oracle: 2
                }
            ]
        },
        {
            id: 369,
            name: "Pokémon eau",
            description: "This dissertation presents a framework for enabling those interactions between components needed for the cooperation we intend, while minimizing the hazards of destructive interference. Great progress on the composition problem has been made within the object paradigm, chiefly in the context of sequential, single-machine programming among benign components.",
            queries: [
                {
                    id: 33,
                    name: "gros",
                    q: "Tortank Leviator",
                    lang: "fr",
                    nbPage: 250, // still not convinced of this one.
                    oracle: 1
                },
                {
                    id: 66,
                    name: "petit",
                    q: "Carapuce Poissirène",
                    lang: "fr",
                    nbPage: 300, // still not convinced of this one.
                    oracle: 1
                }
            ]
        },
        {
            id: 372,
            name: "Pokémon feu",
            description: "We show how to extend this success to support robust composition of concurrent and potentially malicious components distributed over potentially malicious machines. We present E, a distributed, persistent, secure programming language, and CapDesk, a virus-safe desktop built in E, as embodiments of the techniques we explain.",
            queries: [
                {
                    id: 11,
                    name: "gros",
                    q: "Dracaufeu Arcanin",
                    lang: "fr",
                    nbPage: 500, // still not convinced of this one.
                    oracle: 1
                },
                {
                    id: 54,
                    name: "petit",
                    q: "Goupix Salamèche",
                    lang: "fr",
                    nbPage: 550, // still not convinced of this one.
                    oracle: 1
                }
            ]
        }
    ]
};


var nextMyWITerritoireId = 1000;
var nextMyWIQueryId = 1000;

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
                        if(!Object.assign){
                            throw 'add Object.assign polyfill';
                        }
                        
                        var territoire = Object.assign({queries: []}, territoireData, {id: nextMyWITerritoireId++});
                        
                        // add at the beginning of the array so it appears first
                        state.currentUser.territoires.unshift(territoire);
                        
                        // some element of the state.currentUser.territoires array was mutated
                        self.setState({
                            currentUser: state.currentUser,
                            currentTerritoire: state.currentTerritoire //territoire
                        });
                    },
                    createQuery: function(queryData, territoire){
                        if(!Object.assign){
                            throw 'add Object.assign polyfill';
                        }
                        
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