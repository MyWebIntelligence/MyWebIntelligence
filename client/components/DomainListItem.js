"use strict";

var React = require('react');

//var computeSocialImpact = require('../../automatedAnnotation/computeSocialImpact');



/*

interface DomainListItemProps{
    expressionDomain
    expressionDomainAnnotations
    expressionDomainMetrics
    annotate: (annotations): void
}

This component has no state (besides for tags input leftover) and is only handled by its parent (TerritoireViewScreen)

*/


module.exports = React.createClass({
    displayName: 'DomainListItem',
    
    getInitialState: function () {
        return {
            //tagInputValue: ''
        };
    },
    
    shouldComponentUpdate: function(/*nextProps, nextState*/){
        /*var props = this.props;
        var state = this.state;
        
        return props.rejected !== nextProps.rejected ||
            props.resourceAnnotations !== nextProps.resourceAnnotations ||
            props.expressionDomainAnnotations !== nextProps.expressionDomainAnnotations ||
            state.tagInputValue !== nextState.tagInputValue;*/
        return true;
    },
    
    render: function () {
        var props = this.props;
        //var state = this.state;
        //var self = this;

        var annotate = props.annotate;

        var expressionDomain = props.expressionDomain;
        var expressionDomainAnnotations = props.expressionDomainAnnotations;
        
        console.log('expressionDomainAnnotations', expressionDomainAnnotations);
        
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
                    value: expressionDomainAnnotations['media_type'],
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
                expressionDomain.keywords.map(function(tag) {
                    return React.DOM.span(
                        {
                            className: 'tag',
                            key: tag
                        },
                        tag
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
                    props.expressionDomainMetrics.social_impact,
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
