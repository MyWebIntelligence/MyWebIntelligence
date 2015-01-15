"use strict";

var React = require('react');

var TerritoireListItem = require('./TerritoireListItem');
var TerritoireForm = require('./TerritoireForm');


/*

interface TerritoireListProps{
    territoires: MyWITerritoire[],
    onTerritoireListChange: function(ts: MyWITerritoire[]){
    
    },
    createTerritoire: (territoireData) => void
    createQuery: (queryData, territoire: MyWITerritoire) => void
    removeQueryFromTerritoire: (q: MyWIQuery, t: MyWITerritoire) => void
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
                    onTerritoireChange: function(newT){
                        var index = props.territoires.findIndex(function(t){
                            return t.id === newT.id;
                        });
                        
                        props.territoires[index] = newT;
                        
                        props.onTerritoireListChange(props.territoires);
                    },
                    createQuery: function(queryData){
                        props.createQuery(queryData, t);
                    },
                    removeQueryFromTerritoire: props.removeQueryFromTerritoire
                });
            })))
        ]);
    }
});