"use strict";

var React = require('react');

var ImmutableSet = require('immutable').Set;

var DomainListItem = require('./DomainListItem');


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
    displayName: "DomainTab",
    
    _makeDomainGraphNodeList: function(domainGraph, degreeWeakMap){
        var self = this;
        
        return domainGraph.nodes.toJSON()
        .filter(function(n){
            return self.props.approvedExpressionDomainIds.has(n.expression_domain_id);
        })
        .sort(function(n1, n2){
            var deltaDegree = degreeWeakMap.get(n2).degree - degreeWeakMap.get(n1).degree;
            
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
        
        this.setState({
            emitterTypes: new ImmutableSet( Object.keys(newProps.expressionDomainAnnotationsByEDId)
                .map(function(edid){ return newProps.expressionDomainAnnotationsByEDId[edid].emitter_type; }) 
                .filter(function(emitterType){ return !!emitterType; }) 
            ),
            domainGraphNodeList: newProps.domainGraph !== this.props.domainGraph ?
                this._makeDomainGraphNodeList(newProps.domainGraph, graphDegreeWeakMap) :
                this.state.domainGraphNodeList,
            graphDegreeWeakMap: graphDegreeWeakMap
        })
    },
    
    getInitialState: function(){
        var expressionDomainAnnotationsByEDId = this.props.expressionDomainAnnotationsByEDId;
        
        var graphDegreeWeakMap = this.props.domainGraph.makeDegreeWeakMap();
        
        return {
            emitterTypes: new ImmutableSet( Object.keys(expressionDomainAnnotationsByEDId)
                .map(function(edid){ return expressionDomainAnnotationsByEDId[edid].emitter_type; }) 
                .filter(function(emitterType){ return !!emitterType; }) 
            ),
            domainGraphNodeList: this._makeDomainGraphNodeList(this.props.domainGraph, graphDegreeWeakMap),
            graphDegreeWeakMap: graphDegreeWeakMap
        }  
    },
    
    render: function() {
        var props = this.props;
        var state = this.state;
                
        return React.DOM.div(
            {},
            React.DOM.datalist({id: "emitter-types"}, state.emitterTypes.toArray().map(function(t){
                return React.DOM.option({ 
                    key: t,
                    value: t, 
                    label: t
                });
            })),
            React.DOM.ul(
                {
                    className: 'domains'
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
                        degrees : state.graphDegreeWeakMap.get(n)
                    })
                })
            )
        )
        
    }
});
