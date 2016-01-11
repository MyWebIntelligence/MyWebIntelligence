"use strict";

var React = require('react');
var documentOffset = require('global-offset');

var PageListItem = React.createFactory(require('./PageListItem'));

var makeResourceSocialImpactIndexMap = require('../../automatedAnnotation/makeResourceSocialImpactIndexMap');


var DEFAULT_LIST_ITEM_HEIGHT = 20; // very small value by default so that worst case, more items are shown
var DEFAULT_LIST_TOP_OFFSET = 0; // pretend it's at the top so worst case more items are shown

var LIST_START_PADDING = 2;
var LIST_END_PADDING = LIST_START_PADDING;


module.exports = React.createClass({
    displayName: 'PagesTab',
    
    _makePageListItems: function(props, resourceSocialImpactIndexMap){   

        return Object.keys(props.expressionById || {}).length >= 1 ? 
            props.pageGraph.nodes
                .filter(function(n){
                    return n.expression_id && props.resourceAnnotationByResourceId[n.id];
                })
                .sort(function nodeCompare(n1, n2){
                    var rId1 = n1.id;
                    var rId2 = n2.id;

                    return resourceSocialImpactIndexMap.get(rId2) - resourceSocialImpactIndexMap.get(rId1);
                }) 
            : undefined
    },
    
    getInitialState: function(){
        var props = this.props;
        var resourceSocialImpactIndexMap = makeResourceSocialImpactIndexMap(props.resourceAnnotationByResourceId);
            
        return {
            pageListItems: this._makePageListItems(props, resourceSocialImpactIndexMap),
            resourceSocialImpactIndexMap: resourceSocialImpactIndexMap,
            // largely inspired from http://jlongster.com/Removing-User-Interface-Complexity,-or-Why-React-is-Awesome#p78
            // <3 @jlongster
            pageY: 0,
            windowHeight: (typeof window !== "undefined" && window.innerHeight) || 1000
        }
    },
    
    componentWillReceiveProps: function(nextProps) {
        var state = this.state;
        var resourceSocialImpactIndexMap = makeResourceSocialImpactIndexMap(nextProps.resourceAnnotationByResourceId);
        
        var deltaState = {
            pageListItems: this._makePageListItems(nextProps, resourceSocialImpactIndexMap),
            resourceSocialImpactIndexMap: resourceSocialImpactIndexMap
        }
        
        this.setState(Object.assign({}, state, deltaState));
    },
    
    // It is assumed all lis have the same height. The rest of the component will not work if that's not the case
    // Make sure it is with all necessary measures in CSS and HTML
    _listItemHeight: undefined,
    _listTopOffset: undefined,
    componentDidUpdate: function(){        
        if(!this._listItemHeight){ // covers undefined, NaN and 0 
            var thisElement = this.getDOMNode();
            
            var firstLi = thisElement.querySelector('main.territoire ul li');

            if(firstLi){
                this._listItemHeight = parseInt( window.getComputedStyle(firstLi).height );
                this._listTopOffset = documentOffset(thisElement.querySelector('main.territoire ul')).top;
            }
        }
    },
    
    _scheduledRender: undefined,
    // scroll event happen too often, so they need to be throttled via rAF
    _scheduleRender: function(){
        var self = this;
        
        if(self._scheduledRender === undefined){
            self._scheduledRender = requestAnimationFrame(function(){
                self._scheduledRender = undefined;
                self.setState(Object.assign({}, self.state, {
                    pageY: self._pageY,
                    windowHeight: self._windowHeight
                }));
            })
        }
    },
    
    _pageY: undefined,
    _windowHeight: (typeof window !== 'undefined' && window.innerHeight) || 1000,
    _scrollListener: function() {        
        this._pageY = window.pageYOffset;
        this._scheduleRender();
    },
    _resizeListener: function() {
        this._windowHeight = window.innerHeight;
        this._scheduleRender();
    },
    
    
    componentDidMount: function(){
        window.addEventListener('scroll', this._scrollListener);
        window.addEventListener('resize', this._resizeListener);
    },
    
    componentWillUnmount: function(){
        clearTimeout(this._refreshTimeout);
        this._refreshTimeout = undefined;
        
        cancelAnimationFrame(this._scheduledRender);
        this._scheduledRender = undefined;
        window.removeEventListener('scroll', this._scrollListener);
        window.removeEventListener('resize', this._resizeListener);
    },
    
    render: function(){
        var props = this.props;
        var state = this.state;
        
        var expressionById = props.expressionById;
        var expressionDomainsById = props.expressionDomainsById;
        
        var listItemHeight = this._listItemHeight || DEFAULT_LIST_ITEM_HEIGHT;
        var listTopOffset = this._listTopOffset || DEFAULT_LIST_TOP_OFFSET;
        
        var startOffset = state.pageY - listTopOffset;
        var listStartIndex = Math.max(0, Math.floor(startOffset/listItemHeight) - LIST_START_PADDING)
        
        var numberOfDisplayedItems = Math.ceil(state.windowHeight/listItemHeight);
        var listEndIndex = listStartIndex + LIST_START_PADDING + numberOfDisplayedItems + LIST_END_PADDING;
                
        return React.DOM.div(
            {
                className: 'page-list-container',
                style: {
                    height: state.pageListItems ? state.pageListItems.length * listItemHeight + 'px' : '100%'
                }
            },
            React.DOM.ul(
            {
                className: 'result-list',
                style: {
                    transform: 'translateY('+listStartIndex*listItemHeight+'px)'
                }
            }, 
            state.pageListItems ? state.pageListItems
                .slice(listStartIndex, listEndIndex)
                .map(function(node){
                    var expressionId = node.expression_id;
                    var resourceId = node.id;
                    if(expressionId === null || expressionId === undefined)
                        return;

                    var expression = expressionById[expressionId];
                    var resourceAnnotations = props.resourceAnnotationByResourceId ?
                        props.resourceAnnotationByResourceId[resourceId] : 
                        {tags: new Set()};
                    
                    var expressionDomainId = resourceAnnotations.expression_domain_id;
            
                    return new PageListItem({
                        key: resourceId,

                        resourceId: resourceId,

                        url: node.url,
                        title: expression.title,
                        excerpt: expression.excerpt,
                        rejected: props.rejectedResourceIds.has(resourceId),
                        socialImpactIndex: state.resourceSocialImpactIndexMap.get(resourceId),

                        resourceAnnotations: resourceAnnotations,
                        expressionDomain : expressionDomainsById[expressionDomainId],

                        annotate: function(newAnnotations, approved){
                            return props.annotate(resourceId, newAnnotations, approved)
                        }
                    });
                }) : undefined
            )
        )
    }
})
