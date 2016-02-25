"use strict";

var React = require('react');

var ImmutableSet = require('immutable').Set;
//var moment = require('moment');
var documentOffset = require('global-offset');

var PagesTab = React.createFactory(require('./PagesTab'));
var DomainsTab = React.createFactory(require('./DomainsTab'));
    
var abstractGraphToPageGraph = require('../../common/graph/abstractGraphToPageGraph');
var pageGraphToDomainGraph = require('../../common/graph/pageGraphToDomainGraph');
var makeWordGraph = require('../../common/graph/makeWordGraph');

var serverAPI = require('../serverAPI');

var makeResourceSocialImpactIndexMap = require('../../automatedAnnotation/makeResourceSocialImpactIndexMap');

var annotateResource = serverAPI.annotateResource;
var annotateExpressionDomain = serverAPI.annotateExpressionDomain;



/*

interface TerritoireViewScreenProps{
    user: MyWIUser,
    territoire: MyWITerritoire,
    refresh: function(){}: void
}

*/




function generateExpressionGEXF(abstractGraph, expressionById, resourceAnnotationByResourceId, expressionDomainAnnotationsByEDId){
    var pageGraph = abstractGraphToPageGraph(abstractGraph, expressionById, resourceAnnotationByResourceId, expressionDomainAnnotationsByEDId);
    
    return pageGraph.exportAsGEXF();
}


function generateDomainGEXF(abstractGraph, expressionById, resourceAnnotationByResourceId, expressionDomainAnnotationsByEDId, expressionDomainById){
    var pageGraph = abstractGraphToPageGraph(abstractGraph, expressionById, resourceAnnotationByResourceId, expressionDomainAnnotationsByEDId);
    var domainGraph = pageGraphToDomainGraph(pageGraph, expressionDomainById, expressionDomainAnnotationsByEDId);
    
    return domainGraph.exportAsGEXF();
}


function triggerDownload(content, name, type){
    var blob = new Blob([content], {type: type});
    var blobUrl = URL.createObjectURL(blob);

    var a = document.createElement('a');
    a.style.position = "absolute"; // getting off document flow
    // making an effort to hide the element
    a.style.zIndex = -1;
    a.style.opacity = 0;
    
    a.setAttribute('href', blobUrl);
    a.setAttribute('download', name);
    document.body.appendChild(a)
    a.click();
    document.body.removeChild(a);
}


function computeTerritoireTags(annotationByResourceId){
    var territoireTags = new ImmutableSet();
        
    if(annotationByResourceId){
        Object.keys(annotationByResourceId).forEach(function(rid){
            var annotations = annotationByResourceId[rid];
            var tags = annotations.tags || new Set();
            
            tags.forEach(function(t){
                territoireTags = territoireTags.add(t);
            });
        });
    }
    
    return territoireTags;
}


module.exports = React.createClass({
    displayName: 'TerritoireViewScreenContent',
    
    _refreshTimeout: undefined,
    // Territoire data refresh
    _scheduleRefreshIfNecessary: function(){        
        var props = this.props;
        var self = this;
        var t = props.territoire;
        var territoireTaskCount = t && t.progressIndicators && t.progressIndicators.territoireTaskCount;
                
        // for perceived performance purposes, sometimes only a graph with the query results is sent initially.
        // refresh the graph if no edge was found in the graph
        if( self._refreshTimeout === undefined && ((territoireTaskCount && territoireTaskCount >= 1) || (t.graph && t.graph.edges.length === 0))){
            self._refreshTimeout = setTimeout(function(){
                self._refreshTimeout = undefined;
                props.refresh();
            }, 5*1000);
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
    
    
    // maybe schedule a refresh on mount and when receiving props
    componentDidMount: function(){
        this._scheduleRefreshIfNecessary();
        
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


    
    
    // It is assumed all lis have the same height. The rest of the component will not work if that's not the case
    // Make sure it is with all necessary measures in CSS and HTML
    _listItemHeight: undefined,
    _listTopOffset: undefined,
    componentDidUpdate: function(){
        this._scheduleRefreshIfNecessary();
        
        if(!this._listItemHeight){ // covers undefined, NaN and 0 
            var thisElement = this.getDOMNode();
            
            var firstLi = thisElement.querySelector('main.territoire ul li');

            if(firstLi){
                this._listItemHeight = parseInt( window.getComputedStyle(firstLi).height );
                this._listTopOffset = documentOffset(thisElement.querySelector('main.territoire ul')).top;
            }
        }
    },
    
    componentWillReceiveProps: function(nextProps) {
        var state = this.state;
        var territoire = nextProps.territoire;
        
        var resourceAnnotationByResourceId = territoire.resourceAnnotationByResourceId || state.resourceAnnotationByResourceId;
        var expressionDomainAnnotationsByEDId = territoire.expressionDomainAnnotationsByEDId || state.expressionDomainAnnotationsByEDId;
        
        var resourceSocialImpactIndexMap = state.resourceAnnotationByResourceId !== nextProps.territoire.resourceAnnotationByResourceId ?
            makeResourceSocialImpactIndexMap(resourceAnnotationByResourceId) :
            state.resourceSocialImpactIndexMap;
        
        var deltaState = {
            resourceAnnotationByResourceId: resourceAnnotationByResourceId,
            expressionDomainAnnotationsByEDId: expressionDomainAnnotationsByEDId,
            resourceSocialImpactIndexMap: resourceSocialImpactIndexMap,
            territoireTags: state.resourceAnnotationByResourceId !== nextProps.territoire.resourceAnnotationByResourceId ?
                computeTerritoireTags(resourceAnnotationByResourceId) :
                state.territoireTags,
            pageListItems: Object.keys(territoire.expressionById || {}).length >= 1 ? 
                territoire.graph.nodes
                    .filter(function(n){
                        return n.expression_id && territoire.resourceAnnotationByResourceId[n.id];
                    })
                    .sort(function nodeCompare(n1, n2){
                        var rId1 = n1.id;
                        var rId2 = n2.id;

                        return resourceSocialImpactIndexMap.get(rId2) - resourceSocialImpactIndexMap.get(rId1);
                    }) 
                : undefined,
            territoireGraph: territoire && territoire.graph
        };
        
        if(territoire.graph && state.territoireGraph !== territoire.graph){
            if(resourceAnnotationByResourceId){
                deltaState.approvedExpressionDomainIds = new Set(territoire.graph.nodes
                    .filter(function(n){
                        return n.expression_id&& resourceAnnotationByResourceId[n.id]
                    })
                    .map(function(n){
                        return resourceAnnotationByResourceId[n.id].expression_domain_id;
                    })                              
                )   
            }
            
            if(expressionDomainAnnotationsByEDId && resourceAnnotationByResourceId){
                deltaState.domainGraph = pageGraphToDomainGraph(
                    abstractGraphToPageGraph(
                        territoire.graph, 
                        territoire.expressionById, 
                        resourceAnnotationByResourceId,
                        expressionDomainAnnotationsByEDId
                    ),
                    territoire.expressionDomainsById,
                    expressionDomainAnnotationsByEDId
                );
            }
        }
        
        this.setState(Object.assign({}, this.state, deltaState));
    },
    
    getInitialState: function() {
        var territoire = this.props.territoire;
                        
        return {
            currentTab: 'pages', // | 'domains'
            downloadMenuOpen: false,
            
            territoireTags: computeTerritoireTags(territoire.resourceAnnotationByResourceId),
            resourceAnnotationByResourceId: territoire.resourceAnnotationByResourceId,
            expressionDomainAnnotationsByEDId: territoire.expressionDomainAnnotationsByEDId,
            territoireGraph: undefined,
            domainGraph: undefined,
            rejectedResourceIds : new ImmutableSet(),
            approvedExpressionDomainIds: undefined,
            resourceSocialImpactIndexMap: undefined,
            
            // largely inspired from http://jlongster.com/Removing-User-Interface-Complexity,-or-Why-React-is-Awesome#p78
            // <3 @jlongster
            pageY: 0,
            windowHeight: (typeof window !== "undefined" && window.innerHeight) || 1000,
            pageListItems: undefined
        }
    },
    
    
    render: function() {
        var self = this;
        var props = this.props;
        var state = this.state;
        var territoire = props.territoire;
        
        /*var listItemHeight = this._listItemHeight || DEFAULT_LIST_ITEM_HEIGHT;
        var listTopOffset = this._listTopOffset || DEFAULT_LIST_TOP_OFFSET;
        
        var startOffset = state.pageY - listTopOffset;
        var listStartIndex = Math.max(0, Math.floor(startOffset/listItemHeight) - LIST_START_PADDING)
        
        var numberOfDisplayedItems = Math.ceil(state.windowHeight/listItemHeight);
        var listEndIndex = listStartIndex + LIST_START_PADDING + numberOfDisplayedItems + LIST_END_PADDING;*/
                
        return React.DOM.section({id: 'sectionBodyTerritory', className: 'sectionBody on'},
            React.DOM.datalist({id: "tags"}, state.territoireTags.toArray().map(function(t){
                return React.DOM.option({ 
                    key: t, 
                    // adding ; so that clicking on an auto-complete value does autocomplete 
                    // without the user having to hit ';' themself
                    value: t+';', 
                    label: t
                });
            })),
            React.DOM.header({},                
                React.DOM.div({className: 'sectionBodyTerritoriesLabel'},
                    React.DOM.div({className: 'sectionBodyTerritoriesLabelLogo'},
                        React.DOM.img({src: '/images/oneTerritory.png'})             
                    ),
                    React.DOM.div({className: 'sectionBodyTerritoriesLabelTitle'}, territoire.name)
                ),
                React.DOM.div({className: 'sectionBodyTerritoriesInfos'},
                    React.DOM.div({className: 'sectionBodyTerritoriesInfosLogo'},
                        React.DOM.img({src: '/images/oneTerritoryCount.png'})             
                    ),
                    /*React.DOM.div({style: {display: 'flex', flexDirection: 'column', justifyContent: 'center'}},
                        React.DOM.div({className: 'sectionBodyTerritoriesInfos1'}, 'XX')
                    ),*/
                    territoire.progressIndicators ? React.DOM.div({className: 'sectionBodyTerritoriesInfos2'},
                        React.DOM.span({title: "Query oracle results"}, territoire.progressIndicators.queriesResultsCount),
                        '-',
                        React.DOM.span({title: "Crawl todo"}, territoire.progressIndicators.territoireTaskCount),
                        '-',
                        React.DOM.span({title: "Expressions"}, Object.keys(territoire.expressionById || {}).length)
                    ) : undefined
                )              
            ),
            React.DOM.div({id: 'sectionBodyTerritoryButtons'},
                React.DOM.button(
                    {
                        id: 'sectionBodyTerritoryButtonsButtonPages', 
                        className: [
                            'sectionBodyTerritoryButtonsButton',
                            state.currentTab === 'pages' ? 'on' : ''
                        ].join(' ').trim(),
                        onClick: function(){
                            self.setState(Object.assign(
                                state,
                                {currentTab: 'pages', downloadMenuOpen: false}
                            ))
                        }
                    },
                    'Pages'
                ),
                React.DOM.button(
                    {
                        id: 'sectionBodyTerritoryButtonsButtonDomains', 
                        className: [
                            'sectionBodyTerritoryButtonsButton',
                            state.currentTab === 'domains' ? 'on': ''
                        ].join(' ').trim(),
                        onClick: function(){
                            self.setState(Object.assign(
                                state,
                                {currentTab: 'domains', downloadMenuOpen: false}
                            ))
                        }
                    },
                    'Domains'
                ),
                React.DOM.div(
                    {
                        id: 'sectionBodyTerritoryButtonsButtonDownload',
                        className: 'sectionBodyTerritoryButtonsButton',
                        onClick: function(){
                            self.setState(Object.assign(
                                {},
                                state,
                                {downloadMenuOpen: !state.downloadMenuOpen}
                            ))
                        }
                    },
                    'Downloads',
                    ' ',
                    React.DOM.i({className: 'fa fa-caret-down'}),
                    state.downloadMenuOpen ? React.DOM.div(
                        {
                            className: 'all-exports'
                        },
                        React.DOM.a({
                            href: "/territoire/"+territoire.id+"/expressions.csv",
                            download: true
                        }, 'Pages list (CSV)'),
                        React.DOM.a({
                            href: "/territoire/"+territoire.id+"/expressions.csv?main_text=true",
                            download: true
                        }, 'Pages list with main text (CSV)'),
                        React.DOM.a({
                            href: "/territoire/"+territoire.id+"/expressions.gexf",
                            download: territoire.name+'-pages.gexf',
                            onClick: function(e){
                                e.preventDefault();

                                //console.log('before dl', territoire.resourceAnnotationByResourceId, territoire);

                                triggerDownload(
                                    generateExpressionGEXF(
                                        territoire.graph, 
                                        territoire.expressionById, 
                                        territoire.resourceAnnotationByResourceId,
                                        state.expressionDomainAnnotationsByEDId
                                    ),
                                    territoire.name+'-pages.gexf',
                                    "application/gexf+xml"
                                );
                            }
                        }, 'Pages Graph (GEXF)'),
                        React.DOM.a({
                            href: "/territoire/"+territoire.id+"/domains.gexf",
                            download: territoire.name+'-domains.gexf',
                            onClick: function(e){
                                e.preventDefault();

                                var domainsGEXF = generateDomainGEXF(
                                    territoire.graph, 
                                    territoire.expressionById, 
                                    state.resourceAnnotationByResourceId, 
                                    state.expressionDomainAnnotationsByEDId,
                                    territoire.expressionDomainsById
                                )

                                triggerDownload(
                                    domainsGEXF,
                                    territoire.name+'-domains.gexf',
                                    "application/gexf+xml"
                                );
                            }
                        }, 'Domains Graph (GEXF)'),
                        React.DOM.a({
                            href: "/territoire/"+territoire.id+"/cognitive-map.gexf",
                            download: territoire.name+'-cognitive-map.gexf',
                            onClick: function(e){
                                e.preventDefault();

                                var cognitiveMapGraph = makeWordGraph(
                                    territoire.graph.nodes,
                                    territoire.expressionById,
                                    state.resourceAnnotationByResourceId
                                );

                                triggerDownload(
                                    cognitiveMapGraph.exportAsGEXF(),
                                    territoire.name+'-cognitive-map.gexf',
                                    "application/gexf+xml"
                                );
                            }
                        }, 'Cognitive Map (GEXF)')
                    ) : undefined
                )
            ),
            state.currentTab === 'pages' ?
                new PagesTab({
                    expressionById: territoire.expressionById,
                    expressionDomainsById: territoire.expressionDomainsById,
                    expressionDomainAnnotationsByEDId: state.expressionDomainAnnotationsByEDId,
                    resourceAnnotationByResourceId: territoire.resourceAnnotationByResourceId,
                    pageGraph: territoire.graph,
                    territoireId: territoire.id,
                    rejectedResourceIds: state.rejectedResourceIds,
                    annotate: function(resourceId, newAnnotations, approved){
                        newAnnotations = newAnnotations || {}
                        var resourceAnnotations = territoire.resourceAnnotationByResourceId[resourceId];

                        var deltaResourceAnnotations;

                        deltaResourceAnnotations = Object.assign(
                            {}, 
                            newAnnotations, 
                            {approved: approved}
                        );

                        // remove merged object
                        newAnnotations = undefined;

                        // is it worth calling annotateResource?
                        if(Object.keys(deltaResourceAnnotations)
                           .some(function(k){ return deltaResourceAnnotations[k] !== undefined }) ||
                           approved !== undefined
                          ){
                            // TODO add a pending state or something
                            annotateResource(resourceId, territoire.id, deltaResourceAnnotations)
                            .catch(function(err){
                                console.error(
                                    'resource annotation update error', 
                                    resourceId, territoire.id, deltaResourceAnnotations, approved, err
                                );
                            });
                        }

                        // updating annotations locally (optimistically hoping being in sync with the server)
                        var territoireTags = state.territoireTags;

                        // add tags for autocomplete
                        // tags are only added, never removed for autocomplete purposes
                        if(deltaResourceAnnotations.tags){
                            deltaResourceAnnotations.tags.forEach(function(t){
                                territoireTags = territoireTags.add(t);
                            });
                        }

                        state.resourceAnnotationByResourceId[resourceId] = Object.assign(
                            {},
                            resourceAnnotations,
                            deltaResourceAnnotations
                        );

                        var rejectedResourceIds = state.rejectedResourceIds;
                        if(approved !== undefined){
                            rejectedResourceIds = approved ?
                                rejectedResourceIds.delete(resourceId) :
                                rejectedResourceIds.add(resourceId);
                        }

                        self.setState(Object.assign({}, state, {
                            resourceAnnotationByResourceId: state.resourceAnnotationByResourceId, // mutated
                            territoireTags: territoireTags,
                            rejectedResourceIds: rejectedResourceIds
                        }));
                    }
                }) :
                (state.currentTab === 'domains' && Object.keys(territoire.expressionById || {}).length >= 1 && state.domainGraph ? 
                    new DomainsTab({
                        approvedExpressionDomainIds: state.approvedExpressionDomainIds,
                        expressionDomainAnnotationsByEDId: state.expressionDomainAnnotationsByEDId,
                        expressionDomainsById: territoire.expressionDomainsById,
                        domainGraph: state.domainGraph,
                        annotate: function(expressionDomainId, delta){
                            annotateExpressionDomain(expressionDomainId, territoire.id, delta)
                            .catch(function(err){
                                console.error(
                                    'expression domain annotation update error', 
                                    expressionDomainId, territoire.id, delta, err
                                );
                            });

                            state.expressionDomainAnnotationsByEDId[expressionDomainId] = Object.assign(
                                {},
                                state.expressionDomainAnnotationsByEDId[expressionDomainId],
                                delta
                            );

                            self.setState(Object.assign({}, state, {
                                expressionDomainAnnotationsByEDId: state.expressionDomainAnnotationsByEDId // mutated
                            }));
                        },
                        approveResource: function(resourceId, approved){
                            var deltaResourceAnnotations = {approved: approved}

                            annotateResource(resourceId, territoire.id, deltaResourceAnnotations)
                            .catch(function(err){
                                console.error(
                                    'resource annotation from domain update error', 
                                    resourceId, territoire.id, approved, err
                                );
                            });

                            var rejectedResourceIds = state.rejectedResourceIds;
                            if(approved !== undefined){
                                rejectedResourceIds = approved ?
                                    rejectedResourceIds.delete(resourceId) :
                                    rejectedResourceIds.add(resourceId);
                            }

                            self.setState(Object.assign({}, state, {
                                rejectedResourceIds: rejectedResourceIds
                            }));

                        }
                    }) :
                    undefined
                )
        
        );
    }
});
