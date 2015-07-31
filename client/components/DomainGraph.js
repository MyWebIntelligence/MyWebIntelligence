"use strict";

var React = require('react');


/*

interface DomainGraphProps{
    graph: Graph<>
}

*/

var SIGMA_CONTAINER_ID = 'sigma-container';
var MAX_FORCE_ATLAS_TIME = 30*1000;

module.exports = React.createClass({
    displayName: "DomainGraph",
    
    getInitialState: function() {
        return {};
    },
    
    componentDidMount: function(){
        console.log('DomainGraph compontentDidMount', this.props.graph);
        console.log('this.props.graph.edges.size', this.props.graph.edges.size)
        
        this._drawGraph(this.props.graph);
    },
    
    componentWillReceiveProps: function(nextProps){
        console.log('DomainGraph componentWillReceiveProps', nextProps.graph);
        console.log('nextProps.graph.edges.size', nextProps.graph.edges.size)
        
        this._drawGraph(nextProps.graph);
    },
    
    _drawGraph: function(domainGraph){
        
        if(this.graph){
            try{
                this.graph.kill();
            }catch(e){}
        }
        
        var sigmaNodes = [];
        
        var inDegrees = new WeakMap();
        domainGraph.edges.forEach(function(e){
            var deg = inDegrees.get(e.node2);
            inDegrees.set(e.node2, deg ? deg+1 : 1);
        });
        
        domainGraph.nodes.forEach(function(n){
            //console.log('dom grpah node', n);
            
            sigmaNodes.push({
                id: n.title,
                label: n.title,
                x: Math.random(),
                y: Math.random(),
                size: Math.min(inDegrees.get(n)/2, 8),
                color: '#666'
             });
        });
        
        var sigmaEdges = [];
        //console.log('domain edges', domainGraph.edges);
        
        domainGraph.edges.forEach(function(e){
            //console.log('domain graph edge', e);

            sigmaEdges.push({
                id: 'e'+sigmaEdges.length,
                source: e.node1.title,
                target: e.node2.title
            });
        });
        
        
        var sigmaGraph = new sigma({
            graph: {
                nodes: sigmaNodes,
                edges: sigmaEdges
            },
            container: SIGMA_CONTAINER_ID
        });
        
        sigmaGraph.startForceAtlas2({worker: true, barnesHutOptimize: false});
        
        setTimeout(function(){
            sigmaGraph.stopForceAtlas2();
        }, MAX_FORCE_ATLAS_TIME);
        
        this.graph = sigmaGraph;
    },
    
    render: function() {
        return React.DOM.div({id: SIGMA_CONTAINER_ID}, []);
    }
});
