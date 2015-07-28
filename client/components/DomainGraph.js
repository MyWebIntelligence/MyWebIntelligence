"use strict";

var React = require('react');


/*

interface DomainGraphProps{
    graph: Graph<>
}

*/

var SIGMA_CONTAINER_ID = 'sigma-container';

module.exports = React.createClass({
    getInitialState: function() {
        return {};
    },
    
    componentDidMount: function(){
        
        var graph = new sigma({
            graph: {
                nodes: Array(10).fill().map(function(e, i){
                    return {
                        id: 'n' + i,
                        label: 'Node ' + i,
                        x: Math.random(),
                        y: Math.random(),
                        size: 20*Math.random(),
                        color: '#666'
                     }
                }),
                edges: Array(Math.round(Math.random()*30)).fill().map(function(e, i){
                    return {
                        id: 'e'+i,
                        source: 'n'+ Math.floor(Math.random()*10),
                        target: 'n'+ Math.floor(Math.random()*10)
                    }
                })
            },
            container: SIGMA_CONTAINER_ID
        });
        
        graph.startForceAtlas2({worker: true, barnesHutOptimize: false});
        
        setTimeout(function(){
            graph.stopForceAtlas2();
        }, 5000);
        
        this.graph = graph;
    },
    
    render: function() {
        //var props = this.props;
        //var state = this.state;
        
        
        
        
        return React.DOM.div({id: SIGMA_CONTAINER_ID}, []);
    }
});
