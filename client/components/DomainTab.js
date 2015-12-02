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
}

*/

module.exports = React.createClass({
    displayName: "DomainTab",
    
    _makeDomainGraphNodeList: function(domainGraph){
        return domainGraph.nodes.toJSON()
        .filter(function(n){
            return this.props.approvedExpressionDomainIds.has(n.expression_domain_id);
        })
        .sort(function(n1, n2){
            console.log("n1, n2", n1, n2)
            return n2.social_impact - n1.social_impact;
        })
    },
    
    componentWillReceiveProps: function(newProps){
        this.setState({
            emitterTypes: new ImmutableSet( Object.keys(newProps.expressionDomainAnnotationsByEDId)
                .map(function(edid){ return newProps.expressionDomainAnnotationsByEDId[edid].emitter_type; }) 
                .filter(function(emitterType){ return !!emitterType; }) 
            ),
            domainGraphNodeList: newProps.domainGraph !== this.props.domainGraph ?
                this._makeDomainGraphNodeList(newProps.domainGraph) :
                this.state.domainGraphNodeList
        })
    },
    
    getInitialState: function(){
        var expressionDomainAnnotationsByEDId = this.props.expressionDomainAnnotationsByEDId;
        
        return {
            emitterTypes: new ImmutableSet( Object.keys(expressionDomainAnnotationsByEDId)
                .map(function(edid){ return expressionDomainAnnotationsByEDId[edid].emitter_type; }) 
                .filter(function(emitterType){ return !!emitterType; }) 
            ),
            domainGraphNodeList: this._makeDomainGraphNodeList(this.props.domainGraph)
        }  
    },
    
    render: function() {
        var props = this.props;
        var state = this.state;
        
        var domainGraph = props.domainGraph;
        
        console.log('DomainTab domainGraph', domainGraph);
        
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

                    //console.log('ed', expressionDomain, edid, expressionDomainAnnotations.social_impact)

                    return new DomainListItem({
                        key: edid,
                        expressionDomain: expressionDomain,
                        expressionDomainAnnotations: expressionDomainAnnotations,
                        expressionDomainMetrics: n,
                        annotate: function(delta){
                            props.annotate(edid, delta)
                        }
                    })
                })
            )
        )
        
    }
});
