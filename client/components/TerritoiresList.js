"use strict";

var React = require('react');

var TerritoireListItem = React.createFactory(require('./TerritoireListItem'));
var TerritoireForm = React.createFactory(require('./TerritoireForm'));


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
    getInitialState: function(){
        console.log('this.props.territoires.length', this.props.territoires.length)
        return { newTerritoireFormOpen: this.props.territoires.length === 0 };
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
        
        return React.DOM.ul({className: "territoires"}, [
            React.DOM.li(
                {
                    className: state.newTerritoireFormOpen ? '' : 'add',
                    key: '+'
                }, 
                state.newTerritoireFormOpen ?
                    new TerritoireForm({
                        onSubmit: function(territoireData){
                            props.createTerritoire(territoireData);
                            self.setState({ newTerritoireFormOpen: false });
                        },
                        oracles: props.oracles
                    }) :
                    React.DOM.button({
                        onClick: function(){
                            self.setState({ newTerritoireFormOpen: true });
                        }
                    }, '+')
            )].concat(props.territoires.map(function(t){
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
            }))
        );
    }
});
