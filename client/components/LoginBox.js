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
        
        return React.DOM.div({className: "login-box"}, [
            React.DOM.header({}, [
                React.DOM.h1({}, "Login"),
                Spinner({active: state.waiting})
            ]),
            React.DOM.button({
                className: "google",
                onClick: function(e){
                    self.setState({
                        waiting: true
                    });
                    
                    setTimeout(function(){
                        self.setState({
                            waiting: false
                        });
                        data.onLogin( /* ? */ );
                    }, Math.random()*3*1000)
                }
            }, "Google"),
            React.DOM.button({disabled: true, className: "twitter"}, "Twitter"),
            React.DOM.button({disabled: true, className: "linkedin"}, "Linkedin")
        ]);      
    }
});

