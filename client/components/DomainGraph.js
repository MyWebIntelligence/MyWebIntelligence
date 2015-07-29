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
        console.log('DomainGraph compontentDidMount', this.props.graph);
                
        this._drawGraph(this.props.graph);
    },
    
    componentWillReceiveProps: function(nextProps){
        console.log('DomainGraph componentWillReceiveProps', nextProps.graph);
        
        this._drawGraph(nextProps.graph);
    },
    
    _drawGraph: function(domainGraph){
        
        if(this.graph){
            try{
                this.graph.kill();
            }catch(e){}
        }
        
        var sigmaNodes = [];
        domainGraph.nodes.forEach(function(n){
            //console.log('dom grpah node', n);

            sigmaNodes.push({
                id: n.title,
                label: n.title,
                x: Math.random(),
                y: Math.random(),
                size: 20*Math.random(),
                color: '#666'
             });
        });
        
        var sigmaEdges = [];
        console.log('domain edges', domainGraph.edges);
        domainGraph.edges.forEach(function(e, i){
            //console.log('domain graph edge', e);

            sigmaEdges.push({
                id: 'e'+i,
                source: e.source,
                target: e.target
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
        }, 5000);
        
        this.graph = sigmaGraph;
    },
    
    render: function() {
        return React.DOM.div({id: SIGMA_CONTAINER_ID}, []);
    }
});
