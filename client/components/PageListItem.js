"use strict";

var React = require('react');

var findTags = require('../findTags');



/*

interface PageListItemProps{
    resourceId: number,
    
    url: string,
    title: string,
    excerpt: string,
    
    annotations: object map,
    
}

*/


module.exports = React.createClass({
    getInitialState: function () {

        return {
            approved: true,
            annotations: this.props.annotations || {tags: new Set()},
            tagInputValue: ''
        };
    },

    componentWillReceiveProps: function(nextProps) {
        //console.log('nextProps.annotations', nextProps.annotations)
        this.setState(Object.assign({}, this.state, {
            annotations: nextProps.annotations || {tags: new Set()}
        }));
    },

    render: function () {
        var props = this.props;
        var state = this.state;
        var self = this;

        var resourceId = props.resourceId;
        var annotate = props.annotate;

        var annotations = state.annotations;

        var classes = ['page-list-item'];
        if (!state.approved) {
            classes.push('rejected');
        }

        return React.DOM.li({
                key: resourceId,

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
                onClick: function () {
                    var newApproved = !state.approved;

                    annotate(undefined, newApproved)

                    // send HTTP request to change deleted of this resource
                    self.setState({
                        approved: newApproved
                    });
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
                                    var newTags = new Set(annotations.tags)

                                    newTags.delete(tag);

                                    var newAnnotations = Object.assign(
                                        annotations, {
                                            tags: newTags
                                        }
                                    );

                                    annotate(newAnnotations, undefined);

                                    self.setState(
                                        Object.assign(state, {
                                            annotations: newAnnotations
                                        })
                                    );
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

                            var newAnnotations = annotations;

                            if (inputTags.size >= 1) {
                                // merge tags
                                inputTags.forEach(function (t) {
                                    newTags.add(t); // mutate annotations.tags directly
                                });

                                newAnnotations = Object.assign(
                                    annotations, {
                                        tags: newTags
                                    }
                                );

                                annotate(newAnnotations, undefined);
                            }

                            self.setState(
                                Object.assign(state, {
                                    annotations: newAnnotations,
                                    tagInputValue: res.leftover
                                })
                            );

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
                            var newSentiment = annotations.sentiment === 'negative' ? undefined : 'negative';

                            var newAnnotations = Object.assign(
                                annotations, {
                                    sentiment: newSentiment
                                }
                            );

                            annotate(newAnnotations, undefined);

                            self.setState(Object.assign(
                                state, {
                                    annotations: newAnnotations
                                }
                            ));
                        }
                    }, '☹')
                    // only negative sentiment for now          
                ),

                // media-type
                React.DOM.select({
                        value: annotations['media_type'],
                        onChange: function (e) {
                            var newMediaType = e.target.value;

                            var newAnnotations = Object.assign(
                                annotations, {
                                    'media_type': newMediaType
                                }
                            );

                            annotate(newAnnotations, undefined)

                            self.setState(Object.assign(
                                state, {
                                    annotations: newAnnotations
                                }
                            ));
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

                        var newAnnotations = Object.assign(
                            annotations, {
                                favorite: newFavorite
                            }
                        );

                        annotate(newAnnotations, undefined);

                        self.setState(Object.assign(
                            state, {
                                annotations: newAnnotations
                            }
                        ));
                    }
                }, annotations.favorite ? '★' : '☆')
            )

        );
    }
});
