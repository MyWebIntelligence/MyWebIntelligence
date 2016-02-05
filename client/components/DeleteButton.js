"use strict";

var React = require('react');

/*
    A delete button asking for confirmation
    
interface DeleteButtonProps{
    className: string
    askForConfirmation: boolean // (defaults to true)
    onDelete: () => void
}

*/

module.exports = React.createClass({
    displayName: "DeleteButton",
    
    getInitialState: function(){
        return {pendingConfirmation: false};
    },
    
    render: function(){
        var props = this.props;
        var state = this.state;
        var self = this;
        
        var askForConfirmation = 'askForConfirmation' in props ? props.askForConfirmation : true;
        
        var children = [
            React.DOM.button({
                onClick: function(){
                    if(askForConfirmation){
                        self.setState({pendingConfirmation: true});
                    }
                    else{
                        props.onDelete();
                    }
                        
                }
            })
        ];
        
        if(state.pendingConfirmation){
            children.push(React.DOM.div({className: 'confirmation-box'}, [
                React.DOM.h1({}, 'Confirm?'),
                React.DOM.div({className: "button-group"}, [
                    React.DOM.button({
                        className: 'cancel',
                        onClick: function(){
                            self.setState({pendingConfirmation: false});
                        }
                    }, 'cancel'),
                    React.DOM.button({
                        className: 'confirm',
                        onClick: function(){
                            props.onDelete();
                            self.setState({pendingConfirmation: false});
                        }
                    }, 'confirm')
                ])
            ]));
        }
        
        
        return React.DOM.div({
            className: ["delete", props.className].join(' ').trim(),
            title: "delete",
            onClick: function(e){
                e.stopPropagation();
            }
        }, children);
    }
});
