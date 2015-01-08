"use strict";

var React = require('react');
var LoginBox = require('./LoginBox');
var SimpleStart = require('./SimpleStart');
var TerritoiresList = require('./TerritoiresList');

/*
    
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
            
            }
            else{
                console.log('state.currentUser.territoires', state.currentUser.territoires, state.currentUser)
                mainChildren.push(TerritoiresList({territoires: state.currentUser.territoires}));
            }
            
            /*if(state.currentUser.territoire){
                // TODO save last project used and pick this one
                
                headerChildren.push(React.DOM.select({
                    value: state.currentProject ? state.currentProject.id : state.currentUser.projects[0].id,
                    className: "projects",
                    onChange: function(e){
                        var selectedProjectId = Number(e.target.value);
                        
                        if(!([].find)){
                            throw 'Add Array.prototype.find polyfill';
                        }
                        
                        self.setState({
                            currentUser: state.currentUser,
                            // O(n) while could be O(1) with by-projectId cache
                            currentProject: state.currentUser.projects.find(function(p){
                                return p.id === selectedProjectId
                            }),
                        });
                    }
                }, state.currentUser.projects.map(function(p){
                    return React.DOM.option({
                        value: p.id
                    }, p.name);
                })));
            }*/
            
            
            
            headerChildren.push(React.DOM.div({className: "user-infos"}, [
                React.DOM.img({className:"avatar", src: state.currentUser.pictureURL}),
                React.DOM.span({className:"username"}, state.currentUser.username)
            ]));
        }
        
        
        
        if(!state.currentUser){
            mainChildren.push(LoginBox({
                onLogin: function(user){
                    self.setState({
                        currentUser: user,
                        currentTerritoire: undefined
                    });
                }
            }));
            
            mainClassName = "login";
        }
        else{
            //mainChildren.push(SimpleStart());
        }
        
        
        
        return React.DOM.div({className: "react-wrapper"}, [
            
            React.DOM.header({className: mainClassName}, headerChildren),
            
            React.DOM.main({}, mainChildren)
        
        ]);
    }
});