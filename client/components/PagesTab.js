"use strict";

var React = require('react');
var ImmutableMap = require('immutable').OrderedMap;
var documentOffset = require('global-offset');

var PageListItem = React.createFactory(require('./PageListItem'));
var SelectFilter = React.createFactory(require('./SelectFilter'));
var BooleanFilter = React.createFactory(require('./BooleanFilter'));
//var DoubleRangeFilter = React.createFactory(require('./DoubleRangeFilter'));

var makeResourceSocialImpactIndexMap = require('../../automatedAnnotation/makeResourceSocialImpactIndexMap');

var DEFAULT_LIST_ITEM_HEIGHT = 20; // very small value by default so that worst case, more items are shown
var DEFAULT_LIST_TOP_OFFSET = 0; // pretend it's at the top so worst case more items are shown

var LIST_START_PADDING = 5;
var LIST_END_PADDING = LIST_START_PADDING;

var DEFAULT_MEDIA_TYPE = undefined;
var DEFAULT_EMITTER_TYPE = undefined;
var DEFAULT_FAVORITE_FILTER_VALUE = false;
var DEFAULT_SENTIMENT_FILTER_VALUE = '';

var NO_FILTER = '';


module.exports = React.createClass({
    displayName: 'PagesTab',
    
    _makePageListItems: function(props, resourceSocialImpactIndexMap, filterValues, nodeToFilterInfos){   

        return Object.keys(props.expressionById || {}).length >= 1 ? 
            props.pageGraph.nodes
                .filter(function(n){ // filter irrelevant elements
                    return n.expression_id && props.resourceAnnotationByResourceId[n.id];
                })
                .filter(function(n){ // user filter
                    var nodeFilterInfos = nodeToFilterInfos.get(n);
            
                    return (!filterValues.get('media_type') || 
                            filterValues.get('media_type') === nodeFilterInfos.get('media_type')) &&
                        (!filterValues.get('emitter_type') || 
                         filterValues.get('emitter_type') === nodeFilterInfos.get('emitter_type')) &&
                        (filterValues.get('favorite') === false || // keep all expressions if favorite filter is in false
                         filterValues.get('favorite') === nodeFilterInfos.get('favorite')) &&
                        (filterValues.get('sentiment') === '' || // keep all expressions if setiment filter is in ''
                         filterValues.get('sentiment') === nodeFilterInfos.get('sentiment'));
                        
                })
                .sort(function nodeCompare(n1, n2){
                    var rId1 = n1.id;
                    var rId2 = n2.id;

                    return resourceSocialImpactIndexMap.get(rId2) - resourceSocialImpactIndexMap.get(rId1);
                }) 
            : undefined
    },
    
    _makeNodeToFilterInfos: function(nodes, resourceAnnotationByResourceId, expressionDomainAnnotationsByEDId){
        var wm = new WeakMap();
        
        nodes.forEach(function(n){
            var resourceId = n.id;
            
            var resourceAnnotations = resourceAnnotationByResourceId && resourceId ?
                resourceAnnotationByResourceId[resourceId] || {} : 
                {};
            
            var expressionDomainId = resourceAnnotations.expression_domain_id;
            
            var expressionDomainAnnotations = expressionDomainId ? 
                expressionDomainAnnotationsByEDId[expressionDomainId] : undefined;
            
            wm.set(n, new ImmutableMap({
                media_type: expressionDomainAnnotations && expressionDomainAnnotations['media_type'],
                emitter_type: expressionDomainAnnotations && expressionDomainAnnotations['emitter_type'],
                favorite: resourceAnnotations.favorite,
                sentiment: resourceAnnotations.sentiment
            }));
        })
        
        return wm;
    },
    
    getInitialState: function(){
        var props = this.props;
        var resourceSocialImpactIndexMap = makeResourceSocialImpactIndexMap(props.resourceAnnotationByResourceId);
        
        var nodeToFilterInfos = props.pageGraph ?
            this._makeNodeToFilterInfos(
                props.pageGraph.nodes,
                props.resourceAnnotationByResourceId,
                props.expressionDomainAnnotationsByEDId
            ) : undefined;
        
        var defaultFilterValues = new ImmutableMap({
            'media_type': DEFAULT_MEDIA_TYPE,
            'emitter_type': DEFAULT_EMITTER_TYPE,
            'favorite': DEFAULT_FAVORITE_FILTER_VALUE,
            'sentiment': DEFAULT_SENTIMENT_FILTER_VALUE
        })
        
        return {
            resourceSocialImpactIndexMap: resourceSocialImpactIndexMap,
            
            filterValues: defaultFilterValues,
            nodeToFilterInfos: nodeToFilterInfos,
            
            // largely inspired from http://jlongster.com/Removing-User-Interface-Complexity,-or-Why-React-is-Awesome#p78
            // <3 @jlongster
            pageY: 0,
            windowHeight: (typeof window !== "undefined" && window.innerHeight) || 1000
        }
    },
    
    componentWillReceiveProps: function(nextProps) {
        var props = this.props;
        var state = this.state;
        var resourceSocialImpactIndexMap = nextProps !== props ?
            makeResourceSocialImpactIndexMap(nextProps.resourceAnnotationByResourceId) :
            state.resourceSocialImpactIndexMap;
        
        var nodeToFilterInfos = (props.pageGraph !== nextProps.pageGraph || 
           props.resourceAnnotationByResourceId !== nextProps.resourceAnnotationByResourceId ||
           props.expressionDomainAnnotationsByEDId !== nextProps.expressionDomainAnnotationsByEDId) ?
            this._makeNodeToFilterInfos(
                nextProps.pageGraph.nodes,
                nextProps.resourceAnnotationByResourceId,
                nextProps.expressionDomainAnnotationsByEDId
            ) :
            state.nodeToFilterInfos;
        
        var deltaState = {
            resourceSocialImpactIndexMap: resourceSocialImpactIndexMap,
            nodeToFilterInfos: nodeToFilterInfos
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
            
            var firstLi = thisElement.querySelector('#sectionBodyTerritoryPages > *:first-child');

            if(firstLi){
                this._listItemHeight = parseInt( window.getComputedStyle(firstLi).height );
                this._listTopOffset = documentOffset(thisElement.querySelector('#sectionBodyTerritoryPages')).top;
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
        var self = this;
        var props = this.props;
        var state = this.state;
        
        var expressionById = props.expressionById;
        var expressionDomainsById = props.expressionDomainsById;
        
        var listItemHeight = this._listItemHeight || DEFAULT_LIST_ITEM_HEIGHT;
        var listTopOffset = this._listTopOffset || DEFAULT_LIST_TOP_OFFSET;
                
        var startOffset = state.pageY - listTopOffset;
        var listStartIndex = Math.max(0, Math.floor(startOffset/listItemHeight) - LIST_START_PADDING)
        if(listStartIndex % 2 === 1) // CSS styles based on even-ness. Add an element if necessary
            listStartIndex++;
        
        var numberOfDisplayedItems = Math.ceil(state.windowHeight/listItemHeight);
        var listEndIndex = listStartIndex + LIST_START_PADDING + numberOfDisplayedItems + LIST_END_PADDING;
        
        console.log('sizes', state.windowHeight, listItemHeight, listStartIndex)
        
        var pageListItems = this._makePageListItems(
            props, 
            state.resourceSocialImpactIndexMap, 
            state.filterValues, 
            state.nodeToFilterInfos
        );
        
        console.log('PagesTab', 'pageListItems', pageListItems && pageListItems.length)

        var possibleMediaTypes = new ImmutableMap({' -- Media type -- ': NO_FILTER});
        var possibleEmitterTypes = new ImmutableMap({' -- Emitter type -- ': NO_FILTER});
        if(props.pageGraph){
            props.pageGraph.nodes.forEach(function(n){
                var resourceId = n.id;
                var resourceAnnotationByResourceId = props.resourceAnnotationByResourceId;
                var expressionDomainAnnotationsByEDId = props.expressionDomainAnnotationsByEDId;

                var resourceAnnotations = resourceAnnotationByResourceId && resourceId ?
                    resourceAnnotationByResourceId[resourceId] || {} : 
                    {};

                var expressionDomainId = resourceAnnotations.expression_domain_id;

                var expressionDomainAnnotations = expressionDomainAnnotationsByEDId && expressionDomainId ? 
                    expressionDomainAnnotationsByEDId[expressionDomainId] : undefined;

                var mediaType = expressionDomainAnnotations && expressionDomainAnnotations['media_type'];
                var emitterType = expressionDomainAnnotations && expressionDomainAnnotations['emitter_type'];

                if(mediaType)
                    possibleMediaTypes = possibleMediaTypes.set(mediaType, mediaType);
                if(emitterType)
                    possibleEmitterTypes = possibleEmitterTypes.set(emitterType, emitterType);
            });
        }
        
        
        
        return React.DOM.div(
            {
                className: 'page-list-container',
                style: {
                    height: pageListItems ? pageListItems.length * listItemHeight + 'px' : '100%'
                }
            },
            React.DOM.div({id: 'sectionBodyTerritoryFilters'},
                React.DOM.i({className: 'fa fa-filter', title: 'filters'}),
                React.DOM.div({id: 'sectionBodyTerritoryFiltersFilter01', className: 'sectionBodyTerritoryFiltersFilter'},
                    new SelectFilter(
                        {
                            className: 'media_type',
                            value: state.filterValues.get('media_type') || NO_FILTER,
                            options: possibleMediaTypes.toJS(),
                            onChange: function(newValue){
                                console.log("media_type", newValue)
                                
                                self.setState(Object.assign(
                                    {},
                                    state,
                                    {
                                        filterValues: state.filterValues.set('media_type', newValue)
                                    }
                                ))
                            }
                        }
                    )
                ),
                React.DOM.div({id: 'sectionBodyTerritoryFiltersFilter02', className: 'sectionBodyTerritoryFiltersFilter'},
                    new SelectFilter(
                        {
                            className: 'emitter_type',
                            value: state.filterValues.get('emitter_type'),
                            options: possibleEmitterTypes.toJS(),
                            onChange: function(newValue){
                                self.setState(Object.assign(
                                    {},
                                    state,
                                    {
                                        filterValues: state.filterValues.set('emitter_type', newValue)
                                    }
                                ))
                            }
                        }
                    )
                ),
                React.DOM.div({id: 'sectionBodyTerritoryFiltersFilter03', className: 'sectionBodyTerritoryFiltersFilter'},
                    new BooleanFilter(
                        {
                            className: 'favorite',
                            value: state.filterValues.get('favorite'),
                            onChange: function(newValue){
                                self.setState(Object.assign(
                                    {},
                                    state,
                                    {
                                        filterValues: state.filterValues.set('favorite', newValue)
                                    }
                                ))
                            }
                        },
                        React.DOM.i({className: 'fa fa-star'})
                    )
                ),
                React.DOM.div({id: 'sectionBodyTerritoryFiltersFilter04', className: 'sectionBodyTerritoryFiltersFilter'},
                    new BooleanFilter(
                        {
                            className: 'sentiment',
                            value: state.filterValues.get('sentiment') === 'negative',
                            onChange: function(newValue){
                                self.setState(Object.assign(
                                    {},
                                    state,
                                    {
                                        filterValues: state.filterValues.set('sentiment', newValue ? 'negative' : '')
                                    }
                                ))
                            }
                        },
                        '☹'
                    )
                ),
                React.DOM.div({className: 'clear'})
            ),
            React.DOM.div(
                {
                    id: 'sectionBodyTerritoryPages',
                    className: 'sectionBodyTerritoryPage on',
                    style: {
                        transform: 'translateY('+listStartIndex*listItemHeight+'px)'
                    }
                },
                pageListItems && pageListItems
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
                    })
            )
        )
    }
})
