"use strict";

var React = require('react');

var ImmutableSet = require('immutable').Set;

var DomainListItem = React.createFactory(require('./DomainListItem'));


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
    
    _makeDomainGraphNodeList: function(domainGraph, pageRankMap){
        var self = this;
        
        return domainGraph.nodes.toJSON()
        .filter(function(n){
            return self.props.approvedExpressionDomainIds.has(n.expression_domain_id);
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
            domainGraphNodeList: newProps.domainGraph !== this.props.domainGraph ?
                this._makeDomainGraphNodeList(newProps.domainGraph, pagerankByNode) :
                this.state.domainGraphNodeList,
            graphDegreeWeakMap: graphDegreeWeakMap,
            pagerankByNode: pagerankByNode
        })
    },
    
    getInitialState: function(){
        var expressionDomainAnnotationsByEDId = this.props.expressionDomainAnnotationsByEDId;
        
        var graphDegreeWeakMap = this.props.domainGraph.makeDegreeWeakMap();
        var pagerankByNode = this.props.domainGraph.computePageRank();
        
        return {
            emitterTypes: new ImmutableSet( Object.keys(expressionDomainAnnotationsByEDId)
                .map(function(edid){ return expressionDomainAnnotationsByEDId[edid].emitter_type; }) 
                .filter(function(emitterType){ return !!emitterType; }) 
            ),
            domainGraphNodeList: this._makeDomainGraphNodeList(this.props.domainGraph, pagerankByNode),
            graphDegreeWeakMap: graphDegreeWeakMap,
            pagerankByNode: pagerankByNode
        }  
    },
    
    render: function() {
        var props = this.props;
        var state = this.state;
            
        var consideredPageRanks = state.domainGraphNodeList.map(function(node){return state.pagerankByNode.get(node); })
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
            /*React.DOM.div({id: 'sectionBodyTerritoryFilters'},
                React.DOM.div({className: 'clear'})
            ),*/
            
            React.DOM.div(
                {
                    id: 'sectionBodyTerritoryDomains',
                    className: 'sectionBodyTerritoryPage on'
                },
                state.domainGraphNodeList
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
