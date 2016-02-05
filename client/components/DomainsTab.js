"use strict";

var React = require('react');

var ImmutableSet = require('immutable').Set;
var ImmutableMap = require('immutable').OrderedMap;


var DomainListItem = React.createFactory(require('./DomainListItem'));
var SelectFilter = React.createFactory(require('./SelectFilter'));

var NO_FILTER = '';
var NO_MEDIA_TYPE_VALUE = '__no media type value__';
var NO_EMITTER_TYPE_VALUE = '__no emitter type value__';

var DEFAULT_MEDIA_TYPE = NO_FILTER;
var DEFAULT_EMITTER_TYPE = NO_FILTER;

/*

interface DomainTabProps{
    approvedExpressionDomainIds: Set<ExpressionDomainIds>
    expressionDomainAnnotationsByEDId: 
    expressionDomainsById: 
    domainGraph: 
    annotate: (delta): void
    approveResource: (resourceId, newApproved)
}

*/

module.exports = React.createClass({
    displayName: "DomainsTab",
    
    _makeDomainGraphNodeList: function(domainGraph, pageRankMap, filterValues){
        var self = this;
        
        return domainGraph.nodes.toJSON()
        .filter(function(n){
            return self.props.approvedExpressionDomainIds.has(n.expression_domain_id);
        })
        .filter(function(n){ // user filter
            var nodeMediaType = n['media_type'];
            var filterMediaType = filterValues.get('media_type');            
            var nodeEmitterType = n['emitter_type'];
            var filterEmitterType = filterValues.get('emitter_type');            

            return (filterMediaType === NO_FILTER || 
                nodeMediaType === filterMediaType ||
                (!nodeMediaType && filterMediaType === NO_MEDIA_TYPE_VALUE)
                ) &&
                (filterEmitterType === NO_FILTER || 
                nodeEmitterType === filterEmitterType ||
                (!nodeEmitterType && filterEmitterType === NO_EMITTER_TYPE_VALUE)
                )

        })
        .sort(function(n1, n2){
            var deltaDegree = pageRankMap.get(n2) - pageRankMap.get(n1);
            
            // sort by degree then by social_impact if degrees are equal
            return deltaDegree !== 0 ?
                deltaDegree :
                n2.social_impact - n1.social_impact;
        })
    },
    
    componentWillReceiveProps: function(newProps){
        
        var graphDegreeWeakMap = newProps.domainGraph !== this.props.domainGraph ?
            newProps.domainGraph.makeDegreeWeakMap() :
            this.state.graphDegreeWeakMap;
        
        var pagerankByNode = newProps.domainGraph !== this.props.domainGraph ?
            newProps.domainGraph.computePageRank() :
            this.state.pagerankByNode;

        this.setState({
            emitterTypes: new ImmutableSet( Object.keys(newProps.expressionDomainAnnotationsByEDId)
                .map(function(edid){ return newProps.expressionDomainAnnotationsByEDId[edid].emitter_type; }) 
                .filter(function(emitterType){ return !!emitterType; }) 
            ),
            graphDegreeWeakMap: graphDegreeWeakMap,
            pagerankByNode: pagerankByNode,
            filterValues: this.state.filterValues
        })
    },
    
    getInitialState: function(){
        var expressionDomainAnnotationsByEDId = this.props.expressionDomainAnnotationsByEDId;
        
        var graphDegreeWeakMap = this.props.domainGraph.makeDegreeWeakMap();
        var pagerankByNode = this.props.domainGraph.computePageRank();
        
        var defaultFilterValues = new ImmutableMap({
            'media_type': DEFAULT_MEDIA_TYPE,
            'emitter_type': DEFAULT_EMITTER_TYPE
        });
        
        return {
            emitterTypes: new ImmutableSet( Object.keys(expressionDomainAnnotationsByEDId)
                .map(function(edid){ return expressionDomainAnnotationsByEDId[edid].emitter_type; }) 
                .filter(function(emitterType){ return !!emitterType; }) 
            ),
            graphDegreeWeakMap: graphDegreeWeakMap,
            pagerankByNode: pagerankByNode,
            
            filterValues: defaultFilterValues
        }  
    },
    
    render: function() {
        var self = this;
        var props = this.props;
        var state = this.state;
            
        var possibleMediaTypes = new ImmutableMap({
            ' -- Media type --': NO_FILTER,
            '(no media type value)': NO_MEDIA_TYPE_VALUE
        });
        var possibleEmitterTypes = new ImmutableMap({
            ' -- Emitter type -- ': NO_FILTER,
            '(no emitter type value)': NO_EMITTER_TYPE_VALUE
        });

        if(props.domainGraph){
            props.domainGraph.nodes.forEach(function(n){
                var mediaType = n['media_type'];
                var emitterType = n['emitter_type'];

                if(mediaType)
                    possibleMediaTypes = possibleMediaTypes.set(mediaType, mediaType);
                if(emitterType)
                    possibleEmitterTypes = possibleEmitterTypes.set(emitterType, emitterType);
            });
        }
        
        var domainGraphNodeList = this._makeDomainGraphNodeList(
            props.domainGraph,
            state.pagerankByNode,
            state.filterValues
        )
            
        var consideredPageRanks = domainGraphNodeList.map(function(node){return state.pagerankByNode.get(node); })
        var maxConsideredPageRank = Math.max.apply(null, consideredPageRanks);
        var minConsideredPageRank = Math.min.apply(null, consideredPageRanks);
        
        return React.DOM.div(
            {
                className: 'domain-list-container'
            },
            React.DOM.datalist({id: "emitter-types"}, state.emitterTypes.toArray().map(function(t){
                return React.DOM.option({ 
                    key: t,
                    value: t, 
                    label: t
                });
            })),
            React.DOM.div({id: 'sectionBodyTerritoryFilters'},
                React.DOM.i({className: 'fa fa-filter', title: 'filters'}),
                React.DOM.div({id: 'sectionBodyTerritoryFiltersFilter01', className: 'sectionBodyTerritoryFiltersFilter'},
                    new SelectFilter(
                        {
                            className: 'media_type',
                            value: state.filterValues.get('media_type') || NO_FILTER,
                            options: possibleMediaTypes.toJS(),
                            onChange: function(newValue){
                                console.log('new media type filter', newValue)
                                
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
                            value: state.filterValues.get('emitter_type') || NO_FILTER,
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
                )
            ),
            
            React.DOM.div(
                {
                    id: 'sectionBodyTerritoryDomains',
                    className: 'sectionBodyTerritoryPage on'
                },
                domainGraphNodeList
                .map(function(n){
                    var edid = n.expression_domain_id;
                    var expressionDomain = props.expressionDomainsById[edid];
                    var expressionDomainAnnotations = props.expressionDomainAnnotationsByEDId[edid];
                                        
                    return new DomainListItem({
                        key: edid,
                        expressionDomain: expressionDomain,
                        expressionDomainAnnotations: expressionDomainAnnotations,
                        expressionDomainMetrics: n,
                        annotate: function(delta){
                            props.annotate(edid, delta)
                        },
                        approveResource: props.approveResource,
                        degrees : state.graphDegreeWeakMap.get(n),
                        pagerankIndex: Math.ceil( 
                            100*(state.pagerankByNode.get(n) - minConsideredPageRank)/
                            maxConsideredPageRank - minConsideredPageRank
                        )
                    })
                })
            )
        )
        
    }
});
