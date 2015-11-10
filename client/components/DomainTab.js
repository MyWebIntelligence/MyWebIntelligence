"use strict";

var React = require('react');

var DomainListItem = require('./DomainListItem');


/*

interface DomainTabProps{
    approvedExpressionDomainIds: Set<ExpressionDomainIds>
    expressionDomainAnnotationsByEDId: 
    expressionDomainsById: 
    domainGraph: 
}

*/

module.exports = React.createClass({
    displayName: "DomainTab",
    
    render: function() {
        var props = this.props;
        
        var domainGraph = props.domainGraph;
        
        console.log('DomainTab domainGraph', domainGraph);
        
        return React.DOM.ul(
            {
                className: 'domains'
            },
            domainGraph.nodes.toJSON()
                .filter(function(n){
                    return props.approvedExpressionDomainIds.has(n.expression_domain_id);
                })
                .map(function(n){
                    var edid = n.expression_domain_id;
                    var expressionDomain = props.expressionDomainsById[edid];
                    var expressionDomainAnnotations = props.expressionDomainAnnotationsByEDId[edid];

                    //console.log('ed', expressionDomain, edid)

                    return new DomainListItem({
                        expressionDomain: expressionDomain,
                        expressionDomainAnnotations: expressionDomainAnnotations,
                        expressionDomainMetrics: n
                    })
                })
        )
        
        
        
    }
});
