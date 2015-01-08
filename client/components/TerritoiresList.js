"use strict";

var React = require('react');

module.exports = React.createClass({
    getInitialState: function(){
        return {};
    },
    
    render: function(){
        var props = this.props;
        var state = this.state;
        var self = this;
        
        console.log('props', props);

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
            return React.DOM.li({}, [
                React.DOM.a({
                    href: "TODO",
                    onClick: function(e){
                        e.preventDefault();
                    }
                }, [
                    React.DOM.div({className: "name"}, t.name),
                    React.DOM.div({className: "description"}, t.description),
                    React.DOM.ul({className: "queries"}, t.queries.map(function(q){
                        return React.DOM.li({}, q.name);
                    })),
                ])
            ]);
        }));
    }
});