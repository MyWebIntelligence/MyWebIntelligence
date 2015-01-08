"use strict";

var React = require('react');
var Spinner = require('./Spinner');

/*

interface LoginInfos{
    username: string
    pictureURL: string
}

interface LoginBoxProps{
    onLogin: (infos: LoginInfos) => void
}

*/
// https://www.youtube.com/watch?v=nfWlot6h_JM
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
                    nbPage: 400, // still not convinced of this one.
                    oracle: "Twitter Search"
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
                    nbPage: 400, // still not convinced of this one.
                    oracle: "Google"
                },
                {
                    id: 66,
                    name: "petit",
                    q: "Carapuce Poissirène",
                    lang: "fr",
                    nbPage: 400, // still not convinced of this one.
                    oracle: "Google"
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
                    nbPage: 400, // still not convinced of this one.
                    oracle: "Google"
                },
                {
                    id: 54,
                    name: "petit",
                    q: "Goupix Salamèche",
                    lang: "fr",
                    nbPage: 400, // still not convinced of this one.
                    oracle: "Google"
                }
            ]
        }
    ]
};


module.exports = React.createClass({
    getInitialState: function() {
        return {
            waiting: false
        };
    },
    
    render: function() {
        var self = this;
        var data = this.props;
        var state = this.state;
        
        console.log('loginbox state', state);
        
        return React.DOM.div({className: "login-box"}, [
            React.DOM.header({}, [
                React.DOM.h1({}, "Login"),
                Spinner({active: state.waiting})
            ]),
            React.DOM.button({
                className: "google",
                onClick: function(e){
                    console.log('click google');
                    self.setState({
                        waiting: true
                    });
                    
                    setTimeout(function(){
                        self.setState({
                            waiting: false
                        });
                        data.onLogin(loggedInUserStub);
                    }, Math.random()*3*1000)
                }
            }, "Google"),
            React.DOM.button({disabled: true, className: "twitter"}, "Twitter"),
            React.DOM.button({disabled: true, className: "linkedin"}, "Linkedin")
        ]);      
    }
});

