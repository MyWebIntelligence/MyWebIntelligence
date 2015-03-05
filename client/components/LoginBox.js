"use strict";

var React = require('react');

var Spinner = React.createFactory(require('./Spinner'));

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
        var state = this.state;
        
        return React.DOM.div({className: "login-box"}, [
            React.DOM.header({}, [
                React.DOM.h1({}, "Login"),
                new Spinner({active: state.waiting})
            ]),
            React.DOM.a({
                className: "google",
                href: "/auth/google"/*,
                onClick: function(e){
                    self.setState({
                        waiting: true
                    });
                    
                    setTimeout(function(){
                        self.setState({
                            waiting: false
                        });
                        data.onLogin(  );
                    }, Math.random()*3*1000)
                }*/
            }, "Google"),
            React.DOM.button({disabled: true, className: "twitter"}, "Twitter"),
            React.DOM.button({disabled: true, className: "linkedin"}, "Linkedin")
        ]);      
    }
});
