"use strict";

var React = require('react');
var moment = require('moment');

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
                
        var classes = ['sectionBodyTerritoryPagesLine'];
        
        if (props.rejected) {
            classes.push('rejected');
        }
        
        return React.DOM.div({className: classes.join(' '), 'data-resource-id': resourceId},
            React.DOM.div({className: 'sectionBodyTerritoryPagesLineHeader'},
                React.DOM.div({className: 'sectionBodyTerritoryPagesLineHeaderLeft'},
                    React.DOM.div({className: 'sectionBodyTerritoryPagesLineHeaderLeftShare'},
                        React.DOM.i({className: 'fa fa-share-alt'}),
                        ' ',
                        props.socialImpactIndex
                    ),
                    React.DOM.div({className: 'sectionBodyTerritoryPagesLineHeaderLeftFacebookLike'},
                        React.DOM.i({className: 'fa fa-facebook'}),
                        ' ',
                        React.DOM.i({className: 'fa fa-thumbs-o-up'}),
                        ' ',
                        resourceAnnotations.facebook_like
                    ),
                    React.DOM.div({className: 'sectionBodyTerritoryPagesLineHeaderLeftFacebookShare'},
                        React.DOM.i({className: 'fa fa-facebook'}),
                        ' ',
                        React.DOM.i({className: 'fa fa-share'}),
                        ' ',
                        resourceAnnotations.facebook_share
                    ),
                    React.DOM.div({className: 'sectionBodyTerritoryPagesLineHeaderLeftLinkDin'},
                        React.DOM.i({className: 'fa fa-linkedin'}),
                        ' ',
                        resourceAnnotations.linkedin_share
                    ),
                    React.DOM.div({className: 'clear'})
                ),
                // Annotators
                React.DOM.div({className: 'sectionBodyTerritoryPagesLineHeaderRight'},
                    // Publication date
                    React.DOM.div({className: 'sectionBodyTerritoryPagesLineHeaderRightDate'},
                        React.DOM.input({
                            className: 'publication-date',
                            placeholder: 'YYYY-MM-DD',
                            title: 'Publication date',
                            type: 'date',
                            defaultValue: resourceAnnotations.publication_date ? moment(resourceAnnotations.publication_date).format('YYYY-MM-DD') : undefined,
                            onChange: function(e) {
                                var newPublicationDate = e.target.value;

                                if(moment(newPublicationDate, 'YYYY-MM-DD', true).isValid()){
                                    annotate(mixin(
                                        {},
                                        resourceAnnotations,
                                        { publication_date: newPublicationDate }
                                    ), undefined);
                                }
                            }
                        }),
                        React.DOM.a({
                            target: '_blank',
                            href: 'https://www.google.com/search?q='+encodeURIComponent(props.url)+"&as_qdr=y15"
                        }, React.DOM.i({className: 'fa fa-clock-o'}))
                    ),
                                  
                    // Favorite
                    React.DOM.button({
                        className: [
                            'sectionBodyTerritoryPagesLineHeaderRightStar',
                            resourceAnnotations.favorite ? 'active' : ''
                        ].join(' '),
                        onClick: function () {
                            var newFavorite = !resourceAnnotations.favorite;

                            annotate(mixin(
                                {},
                                resourceAnnotations,
                                { favorite: newFavorite }
                            ), undefined);
                        }
                    }, React.DOM.i({className: 'fa '+(resourceAnnotations.favorite ? 'fa-star' : 'fa-star-o')})),
                                  
                    // Sentiment
                    React.DOM.button({
                        className: [
                            'sectionBodyTerritoryPagesLineHeaderRightFrown',
                            'negative',
                            (resourceAnnotations.sentiment === 'negative' ? 'active' : '')
                        ].join(' '),
                        onClick: function () {
                            // empty string means "no sentiment annotation"
                            var newSentiment = resourceAnnotations.sentiment === 'negative' ? '' : 'negative';

                            annotate(mixin(
                                {},
                                resourceAnnotations,
                                { sentiment: newSentiment }
                            ), undefined);
                        }
                    }, React.DOM.i({className: 'fa fa-frown-o'})),
                                  
                    // Reject
                    React.DOM.button({
                        className: 'sectionBodyTerritoryPagesLineHeaderRightTrash',
                        onClick: function (){
                            // if props.rejected was false (approved === true), we want newApproved to be false (approved === false)
                            var newApproved = props.rejected;

                            annotate(undefined, newApproved);
                        }
                    }, React.DOM.i({className: 'fa fa-trash'}))
                ),
                React.DOM.div({className: 'clear'})
            ),
            React.DOM.a({
                href: expressionDomain.main_url,
                target: '_blank',
                className: 'sectionBodyTerritoryPagesLineUrl'
            }, expressionDomain.name),
            React.DOM.a({
                className: 'sectionBodyTerritoryPagesLineTitle',
                href: props.url,
                target: '_blank'
            }, props.title),
            React.DOM.a({
                className: 'sectionBodyTerritoryPagesLineFullUrl',
                href: props.url,
                target: '_blank'
            }, props.url),
            React.DOM.div({
                className: 'sectionBodyTerritoryPagesLineDescription'
            }, props.excerpt),
            React.DOM.div(
                {
                    className: 'sectionBodyTerritoryPagesLineTags'
                },
                resourceAnnotations.tags.toJSON().map(function (tag) {
                    return React.DOM.div({
                            className: 'sectionBodyTerritoryPagesLineTagsTag',
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
                        }, React.DOM.i({className: 'fa fa-times'})),
                        // invisible semi-colon as tag separator for sweet tag copy/paste
                        React.DOM.span({ style: { opacity: 0 } }, ';')
                    )
                })
            ),             
            React.DOM.div({
                className: 'sectionBodyTerritoryPagesLineAddTag'
            }, React.DOM.input({
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
            }))
        )
    }
});
