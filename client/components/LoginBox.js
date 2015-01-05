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
                        data.onLogin({
                            username: "Amar Lakel",
                            pictureURL: "https://pbs.twimg.com/profile_images/486464993626308608/AH-pheJB.jpeg"
                        });
                    }, Math.random()*6*1000)
                }
            }, "Google"),
            React.DOM.button({disabled: true, className: "twitter"}, "Twitter"),
            React.DOM.button({disabled: true, className: "linkedin"}, "Linkedin")
        ]);      
    }
});

