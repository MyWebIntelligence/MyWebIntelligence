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

var loggedInUserStub = {
    id: 456,
    username: "Amar Lakel",
    pictureURL: "https://pbs.twimg.com/profile_images/486464993626308608/AH-pheJB.jpeg",
    projects: [
        {
            id: 396,
            name: "Chocolatiers Bordeaux",
            territoires : [
                {
                    id: 83,
                    name: "Twitter chocolatiers",
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
                }
            ]
        },
        {
            id: 987,
            name: "Dresseurs Pokémon",
            territoires : [
                {
                    id: 369,
                    name: "Pokémon eau",
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
        }
    ]
}


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

