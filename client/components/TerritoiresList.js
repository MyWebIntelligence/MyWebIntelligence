"use strict";

var React = require('react');

var TerritoireListItem = require('./TerritoireListItem');

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
        
        return React.DOM.ul({className: "territoires"}, props.territoires.map(function(t){
            return TerritoireListItem({territoire: t});
        }));
    }
});