"use strict";

var React = require('react');

var TerritoireListItem = React.createFactory(require('./TerritoireListItem'));
var TerritoireForm = React.createFactory(require('./TerritoireForm'));


/*

interface TerritoireListProps{
    territoires: MyWITerritoire[],
    onTerritoireChange: function(ts: MyWITerritoire[]){}
    createTerritoire: (territoireData) => void
    deleteTerritoire: (territoire: MyWITerritoire) => void
    
    createQueryInTerritoire: (queryData, territoire: MyWITerritoire) => void
    removeQueryFromTerritoire: (q: MyWIQuery, t: MyWITerritoire) => void
    onQueryChange: props.onQueryChange
}


*/

module.exports = React.createClass({
    getInitialState: function(){
        return { newTerritoireFormOpen: false };
    },
    
    render: function(){
        var props = this.props;
        var state = this.state;
        var self = this;

        /*
            <ul class="territoires">
                <li>
                    <a href="">
                        <div class="name">fliquepluch</div>
                        <div class="description">mjdfjezfjfz</div>
                        <ul class="queries">
                            <li>query1
                            <li>query2
                        </ul>
                    </a>
                    <button class="delete"></button>
                <li>
            </ul>
        */
        
        return React.DOM.div({className: "territoires"}, [
            React.DOM.h1({}, "Territoires"),
            React.DOM.ul({className: "territoires"}, [
                React.DOM.li({className: state.newTerritoireFormOpen ? '' : 'add'}, 
                    state.newTerritoireFormOpen ?
                        TerritoireForm({
                            onSubmit: function(territoireData){
                                props.createTerritoire(territoireData);
                                self.setState({ newTerritoireFormOpen: false });
                            }
                        }) :
                        React.DOM.button({
                            onClick: function(){
                                self.setState({ newTerritoireFormOpen: true });
                            }
                        }, '+')
                )
            ].concat(props.territoires.map(function(t){
                return TerritoireListItem({
                    territoire: t,
                    onTerritoireChange: props.onTerritoireChange,
                    deleteTerritoire: props.deleteTerritoire,
                    createQueryInTerritoire: props.createQueryInTerritoire,
                    removeQueryFromTerritoire: props.removeQueryFromTerritoire,
                    onQueryChange: props.onQueryChange
                });
            })))
        ]);
    }
});