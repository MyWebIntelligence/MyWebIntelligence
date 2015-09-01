"use strict";

var React = require('react');

var annotate = require('../serverAPI').annotate;

/*

interface PageListItemProps{
    resourceId: number,
    territoireId: number,
    
    url: string,
    title: string,
    excerpt: string,
    
    annotations: object map
}

*/


module.exports = React.createClass({
    getInitialState: function() {
        return {
            approved: true
        };
    },
    
    render: function() {
        var props = this.props;
        var state = this.state;
        var self = this;
        
        var resourceId = props.resourceId;
        var territoireId = props.territoireId;
        
        var classes = ['page-list-item'];
        if(!state.approved){
            classes.push('rejected');
        }
        
        return React.DOM.li(
            {
                key: resourceId,
                
                className: classes.join(' '),
                "data-resource-id": resourceId
            }, 
            React.DOM.a({ href: props.url, target: '_blank' },
                React.DOM.h3({}, props.title),
                React.DOM.h4({}, props.url)
            ),
            React.DOM.div({ className: 'excerpt' }, props.excerpt),
            React.DOM.button({
                className : 'reject',
                onClick: function(){
                    var newApproved = !state.approved;
                    
                    annotate(resourceId, territoireId, undefined, newApproved) // TODO add a pending state or something
                        .catch(function(err){
                            console.error('annotation error', resourceId, territoireId, newApproved, err);
                        }); 
                    
                    // send HTTP request to change deleted of this resource
                    self.setState({
                        approved: newApproved
                    });
                }
            }, '🗑'),
            React.DOM.div({ className: 'annotations' },
                // keywords
                React.DOM.div({}, 
                    [
                        'Rhum', 'Vin Australien', 'Vin de Bordeaux'
                    ].map(function(tag){
                        return React.DOM.span({className: 'tag'}, tag)
                    }),
                    React.DOM.input({text: 'input'})
                ),
                          
                // negative
                React.DOM.button({}, '☹'),
            
                // type
                React.DOM.select({}, ["", "Institutional", "Thematique", "Web dictionary", "Editorial", "Blog", "Forum", "Social Network", "Search Engine"].map(function(type){
                    return React.DOM.option({
                        value: type
                    }, type)
                })),
                
                // fav
                React.DOM.button({}, '☆') // ★
            )
                           
        );
    }
});
