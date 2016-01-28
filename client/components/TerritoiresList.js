"use strict";

var React = require('react');

var TerritoireListItem = React.createFactory(require('./TerritoireListItem'));

/*

interface TerritoireListProps{
    territoires: MyWITerritoire[],
    oracles: MyWIOracle[]
    onTerritoireChange: function(ts: MyWITerritoire[]){}
    createTerritoire: (territoireData) => void
    deleteTerritoire: (territoire: MyWITerritoire) => void
    
    createQueryInTerritoire: (queryData, territoire: MyWITerritoire) => void
    removeQueryFromTerritoire: (q: MyWIQuery, t: MyWITerritoire) => void
    onQueryChange: props.onQueryChange
}


*/

module.exports = React.createClass({
    displayName: 'TerritoiresList',
    
    render: function(){
        var props = this.props;
        
        return React.DOM.section({id: 'sectionBodyTerritories', className: 'sectionBody on'},
            props.territoires.map(function(t){
                return new TerritoireListItem({
                    key: t.id,
                    territoire: t,
                    oracles: props.oracles,
                    onTerritoireChange: props.onTerritoireChange,
                    deleteTerritoire: props.deleteTerritoire,
                    createQueryInTerritoire: props.createQueryInTerritoire,
                    removeQueryFromTerritoire: props.removeQueryFromTerritoire,
                    onQueryChange: props.onQueryChange
                });
            })
        );
    }
});
