"use strict";

var React = require('react');
var ImmutableSet = require('immutable').Set;

//var computeSocialImpact = require('../../automatedAnnotation/computeSocialImpact');



/*

interface DomainListItemProps{
    expressionDomain
    expressionDomainAnnotations
    expressionDomainMetrics
    annotate: (annotations): void,
    approveResource:():void
}

This component has no state (besides for tags input leftover) and is only handled by its parent (TerritoireViewScreen)

*/


module.exports = React.createClass({
    displayName: 'DomainListItem',
    
    getInitialState: function(){
        return {
            rejectedResources: new ImmutableSet()
        }
    },
    
    shouldComponentUpdate: function(nextProps, nextState){
        var props = this.props;
        var state = this.state;
        
        return props.expressionDomainAnnotations.emitter_type !== nextProps.expressionDomainAnnotations.emitter_type ||
            props.expressionDomainAnnotations.media_type !== nextProps.expressionDomainAnnotations.media_type || 
            state.rejectedResources !== nextState.rejectedResources;
    },
    
    render: function () {
        var self = this;
        var props = this.props;
        var state = this.state;

        var annotate = props.annotate;

        var expressionDomain = props.expressionDomain;
        var expressionDomainAnnotations = props.expressionDomainAnnotations;
                
        var classes = ['territoire-list-item', 'domain-list-item'];
        

        return React.DOM.li(
            {
                className: classes.join(' '),
                "data-expression-domain-id": expressionDomain.id
            },
            React.DOM.header(
                {},
                React.DOM.input({
                    placeholder: "Emitter type",
                    type: 'text',
                    list: 'emitter-types',
                    defaultValue: expressionDomainAnnotations.emitter_type,
                    onBlur: function(e){
                        var newEmitterType = e.target.value;

                        annotate({ 'emitter_type': newEmitterType });
                    }
                }),
                
                // media type
                React.DOM.select({
                    value: expressionDomainAnnotations.media_type,
                    onChange: function(e){
                        var newMediaType = e.target.value;

                        annotate({ 'media_type': newMediaType });
                    }
                }, ["", "Institutional", "Thematique",
                 "Web dictionary", "Editorial", "Blog",
                 "Forum", "Social Network", "Search Engine", "E-commerce"]
                .map(function (type) {
                    return React.DOM.option({
                        value: type
                    }, type)
                }))
            ),
            
            React.DOM.a({
                    href: expressionDomain.main_url,
                    target: '_blank'
                },
                React.DOM.h3({}, expressionDomain.title + ' ' + '('+props.expressionDomainMetrics.nb_expressions+')'),
                React.DOM.h4({}, expressionDomain.main_url)
            ),
            React.DOM.div({
                className: 'excerpt'
            }, expressionDomain.description),

            // tags
            React.DOM.div(
                {
                    className: 'tags'
                },
                (new Set(expressionDomain.keywords)).toJSON().map(function(tag) {
                    return React.DOM.span(
                        {
                            className: 'tag',
                            key: tag
                        },
                        tag
                    )
                })
            ),
            
            React.DOM.ul(
                {
                    className: 'urls'
                },
                props.expressionDomainMetrics.urls.map(function(resource){
                    var url = resource.url;
                    var id = resource.resource_id;
                    
                    return React.DOM.li(
                        {
                            className: state.rejectedResources.has(id) ? 'rejected' : ''
                        },
                        React.DOM.a(
                            {  
                                href: url,
                                title: url,
                                target: '_blank'
                            },
                            url
                        ),
                        React.DOM.button({
                            className: 'reject',
                            onClick: function (){
                                var rejected = state.rejectedResources;
                                
                                // if state.rejectedResources.has(resource.id) was false (approved === true), 
                                // we want newApproved to be false (approved === false)
                                var newApproved = rejected.has(id);
                                
                                props.approveResource(id, newApproved);
                                
                                self.setState(Object.assign(
                                    {}, 
                                    state,
                                    {
                                        rejectedResources: newApproved ?
                                            rejected.delete(id) :
                                            rejected.add(id)
                                    }
                                ))
                            }
                        }, React.DOM.i({className: 'fa fa-trash-o'}))
                    )
                    
                    
                })
            ),
             
            // automated annotations
            React.DOM.div(
                {
                    className: 'metrics'
                },
                React.DOM.span({title: 'Potential audience'},
                    props.expressionDomainMetrics.estimated_potential_audience,
                    ' ',
                    React.DOM.i({className: 'fa fa-users'})
                ),
                React.DOM.span({title: 'Social Impact'},
                    props.expressionDomainMetrics.social_impact_index,
                    ' ',
                    React.DOM.i({className: 'fa fa-share-alt'})
                ),
                React.DOM.span({title: 'Sum likes'},
                    props.expressionDomainMetrics.sum_likes,
                    ' ',
                    React.DOM.i({className: 'fa fa-plus'}),
                    ' ',
                    React.DOM.i({className: 'fa fa-thumbs-o-up'})
                ),
                React.DOM.span({title: 'Sum shares'},
                    props.expressionDomainMetrics.sum_shares,
                    ' ',
                    React.DOM.i({className: 'fa fa-plus'}),
                    ' ',
                    React.DOM.i({className: 'fa fa-share-square-o'})
                )
                
            )

        );
    }
});
