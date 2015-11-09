"use strict";

var React = require('react');


/*

interface DomainTabProps{
    approvedExpressionDomainIds: Set<ExpressionDomainIds>
    expressionDomainAnnotationsByEDId: 
    expressionDomainsById: 
}

*/

module.exports = React.createClass({
    displayName: "DomainTab",
    
    render: function() {
        var props = this.props;
        
        return React.DOM.ul(
            {
                className: 'domains'
            },
            props.approvedExpressionDomainIds.toJSON().map(function(edid){
                var expressionDomain = props.expressionDomainsById[edid];
                console.log('ed', expressionDomain, edid)
                //var expressionDomainAnnotations = props.expressionDomainAnnotationsByEDId[edid];

                return React.DOM.li({}, expressionDomain.name);
            })
        )
        
        
        
    }
});
