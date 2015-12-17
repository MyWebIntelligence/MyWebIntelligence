"use strict";

var React = require('react');

var findTags = require('../findTags');


var mixin = Object.assign;

/*

interface PageListItemProps{
    resourceId: number,
    
    url: string,
    title: string,
    excerpt: string,
    
    resourceAnnotations: object map,
    expressionDomain: object map,
    socialImpactIndex: number
    
    rejected?: boolean, // can only be true. undefined otherwise
    annotate: (annotations, approved): void
}

This component has no state (besides for tags input leftover) and is only handled by its parent (TerritoireViewScreen)

*/


module.exports = React.createClass({
    
    getInitialState: function () {
        return {
            tagInputValue: ''
        };
    },
    
    shouldComponentUpdate: function(nextProps, nextState){
        var props = this.props;
        var state = this.state;
        
        return props.rejected !== nextProps.rejected ||
            props.resourceAnnotations !== nextProps.resourceAnnotations ||
            props.expressionDomainAnnotations !== nextProps.expressionDomainAnnotations ||
            state.tagInputValue !== nextState.tagInputValue;
    },
    
    render: function () {
        var props = this.props;
        var state = this.state;
        var self = this;

        var resourceId = props.resourceId;
        var annotate = props.annotate;

        var resourceAnnotations = props.resourceAnnotations;
        var expressionDomain = props.expressionDomain;
        
        var classes = ['territoire-list-item', 'page-list-item'];
        if (props.rejected) {
            classes.push('rejected');
        }
        
        return React.DOM.li(
            {
                className: classes.join(' '),
                "data-resource-id": resourceId
            },
            React.DOM.header(
                {},
                React.DOM.a(
                    {
                        href: expressionDomain.main_url,
                        target: '_blank'
                    },
                    expressionDomain.name
                )
            ),
            React.DOM.a({
                    href: props.url,
                    target: '_blank'
                },
                React.DOM.h3({}, props.title),
                React.DOM.h4({}, props.url)
            ),
            React.DOM.div({
                className: 'excerpt'
            }, props.excerpt),

            // tags
            React.DOM.div(
                {
                    className: 'tags'
                },
                resourceAnnotations.tags.toJSON().map(function (tag) {
                    return React.DOM.span({
                            className: 'tag',
                            key: tag
                        },
                        tag,
                        React.DOM.button({
                            className: 'delete',
                            onClick: function () {
                                var newTags = new Set(resourceAnnotations.tags);
                                newTags.delete(tag);

                                annotate(mixin(
                                    {},
                                    resourceAnnotations,
                                    { tags: newTags }
                                ), undefined);
                            }
                        }, ''),
                        // invisible semi-colon as tag separator for sweet tag copy/paste
                        React.DOM.span({
                            style: {
                                opacity: 0                                }
                        }, ';')
                    )
                })
            ),
                     

            React.DOM.div(
                {
                    className: 'annotators'
                },
                
                // sentiment
                // only negative sentiment for now          
                React.DOM.button({
                    className: ['sentiment', 'negative', (resourceAnnotations.sentiment === 'negative' ? 'active' : '')].join(' '),
                    onClick: function () {
                        // empty string means "no sentiment annotation"
                        var newSentiment = resourceAnnotations.sentiment === 'negative' ? '' : 'negative';

                        annotate(mixin(
                            {},
                            resourceAnnotations,
                            { sentiment: newSentiment }
                        ), undefined);
                    }
                }, '☹'),

                // favorite
                React.DOM.button({
                    className: ['favorite', (resourceAnnotations.favorite ? 'active' : '')].join(' '),
                    onClick: function () {
                        var newFavorite = !resourceAnnotations.favorite;

                        annotate(mixin(
                            {},
                            resourceAnnotations,
                            { favorite: newFavorite }
                        ), undefined);
                    }
                }, resourceAnnotations.favorite ? '★' : '☆'),
                
                // rejection/approval button
                React.DOM.button({
                    className: 'reject',
                    onClick: function (){
                        // if props.rejected was false (approved === true), we want newApproved to be false (approved === false)
                        var newApproved = props.rejected;

                        annotate(undefined, newApproved);
                    }
                }, React.DOM.i({className: 'fa fa-trash-o'}))
            ),
            
                   
                            
            // annotations
            React.DOM.div(
                {
                    className: 'annotations'
                },
                React.DOM.input({
                    type: 'text',
                    list: "tags",
                    value: state.tagInputValue,
                    onChange: function (e) {
                        var value = e.target.value;

                        var res = findTags(value);
                        var inputTags = res.tags;

                        var newTags = new Set(resourceAnnotations.tags)

                        if (inputTags.size >= 1) {
                            // merge tags
                            inputTags.forEach(function (t) {
                                newTags.add(t);
                            });

                            annotate(mixin(
                                {},
                                resourceAnnotations,
                                { tags: newTags }
                            ), undefined);
                        }

                        self.setState({
                            tagInputValue: res.leftover
                        });

                    }
                })   
            ),
            
            // automated annotations
            React.DOM.div(
                {
                    className: 'metrics'
                },
                React.DOM.span({title: 'Social impact index'},
                    props.socialImpactIndex,
                    ' ',
                    React.DOM.i({className: 'fa fa-share-alt'})
                ),
                React.DOM.span({title: 'Facebook Like', style: {color: "#47639e"}},
                    resourceAnnotations.facebook_like,
                    ' ',
                    React.DOM.i({className: 'fa fa-facebook-square'}),
                    ' ',
                    React.DOM.i({className: 'fa fa-thumbs-o-up'})
                ),
                React.DOM.span({title: 'Facebook Share', style: {color: "#47639e"}},
                    resourceAnnotations.facebook_share,
                    ' ',
                    React.DOM.i({className: 'fa fa-facebook-square'}),
                    ' ',
                    React.DOM.i({className: 'fa fa-share-square-o'})
                ),
                React.DOM.span({title: 'Linkedin Share', style: {color: "#2088BD"}},
                    resourceAnnotations.linkedin_share,
                    ' ',
                    React.DOM.i({className: 'fa fa-linkedin-square'}),
                    ' ',
                    React.DOM.i({className: 'fa fa-share-square-o'})
                ),
                resourceAnnotations.google_pagerank !== undefined ? 
                    React.DOM.span({title: 'Google PageRank'},
                        resourceAnnotations.google_pagerank,
                        ' ',
                        React.DOM.i({className: 'fa fa-google'}),
                        ' ',
                        'PR'
                    ) :
                    undefined
            )

        );
    }
});
