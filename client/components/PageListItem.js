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
    
    annotations: object map,
    
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
            props.annotations !== nextProps.annotations ||
            state.tagInputValue !== nextState.tagInputValue;
    },
    
    render: function () {
        var props = this.props;
        var state = this.state;
        var self = this;

        var resourceId = props.resourceId;
        var annotate = props.annotate;

        var annotations = props.annotations;
        
        var classes = ['page-list-item'];
        if (props.rejected) {
            classes.push('rejected');
        }

        return React.DOM.li({
                className: classes.join(' '),
                "data-resource-id": resourceId
            },
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

            // rejection/approval button
            React.DOM.button({
                className: 'reject',
                onClick: function (){
                    // if props.rejected was false (approved === true), we want newApproved to be false (approved === false)
                    var newApproved = props.rejected;

                    annotate(annotations, newApproved);
                }
            }, '🗑'),

            // annotations
            React.DOM.div({
                    className: 'annotations'
                },
                // tags
                React.DOM.div({
                        className: 'tags'
                    },
                    annotations.tags.toJSON().map(function (tag) {
                        return React.DOM.span({
                                className: 'tag',
                                key: tag
                            },
                            tag,
                            React.DOM.button({
                                className: 'delete',
                                onClick: function () {
                                    var newTags = new Set(annotations.tags);
                                    newTags.delete(tag);

                                    annotate(mixin(
                                        {},
                                        annotations,
                                        { tags: newTags }
                                    ), undefined);
                                }
                            }, ''),
                            // invisible semi-colon as tag separator for sweet tag copy/paste
                            React.DOM.span({
                                style: {
                                    opacity: '0'
                                }
                            }, ';')
                        )
                    }),
                    React.DOM.input({
                        type: 'text',
                        list: "tags",
                        value: state.tagInputValue,
                        onChange: function (e) {
                            var value = e.target.value;

                            var res = findTags(value);
                            var inputTags = res.tags;

                            var newTags = new Set(annotations.tags)

                            if (inputTags.size >= 1) {
                                // merge tags
                                inputTags.forEach(function (t) {
                                    newTags.add(t);
                                });

                                annotate(mixin(
                                    {},
                                    annotations,
                                    { tags: newTags }
                                ), undefined);
                            }

                            self.setState({
                                tagInputValue: res.leftover
                            });
                            
                        }
                    })
                ),

                // sentiment
                React.DOM.div({
                        className: 'sentiment'
                    },
                    // negative
                    React.DOM.button({
                        className: ['negative', (annotations.sentiment === 'negative' ? 'active' : '')].join(' '),
                        onClick: function () {
                            // empty string means "no sentiment annotation"
                            var newSentiment = annotations.sentiment === 'negative' ? '' : 'negative';

                            annotate(mixin(
                                {},
                                annotations,
                                { sentiment: newSentiment }
                            ), undefined);
                        }
                    }, '☹')
                    // only negative sentiment for now          
                ),

                // media-type
                React.DOM.select({
                        value: annotations['media_type'],
                        onChange: function (e) {
                            var newMediaType = e.target.value;
                            
                            annotate(mixin(
                                {},
                                annotations,
                                { 'media_type': newMediaType }
                            ), undefined);
                        }
                    }, ["", "Institutional", "Thematique",
                     "Web dictionary", "Editorial", "Blog",
                     "Forum", "Social Network", "Search Engine"]
                    .map(function (type) {
                        return React.DOM.option({
                            value: type
                        }, type)
                    })
                ),

                // favorite
                React.DOM.button({
                    className: ['favorite', (annotations.favorite ? 'active' : '')].join(' '),
                    onClick: function () {
                        var newFavorite = !annotations.favorite;

                        annotate(mixin(
                            {},
                            annotations,
                            { favorite: newFavorite }
                        ), undefined);
                    }
                }, annotations.favorite ? '★' : '☆')
            )

        );
    }
});
