"use strict";

var React = require('react');

var TerritoireListItem = require('./TerritoireListItem');

/*

interface TerritoireListProps{
    territoires: MyWITerritoire[],
    onTerritoireListChange: function(ts: MyWITerritoire[]){
    
    }
}


*/

module.exports = React.createClass({
    getInitialState: function(){
        return {};
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
            React.DOM.ul({className: "territoires"}, props.territoires.map(function(t){
                return TerritoireListItem({
                    territoire: t,
                    onTerritoireChange: function(newT){
                        var index = props.territoires.findIndex(function(t){
                            return t.id === newT.id;
                        });
                        
                        props.territoires[index] = newT;
                        
                        props.onTerritoireListChange(props.territoires);
                    }
                });
            }))
        ]);
    }
});