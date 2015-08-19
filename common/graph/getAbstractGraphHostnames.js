"use strict";

/*
    graph: abstractGraph
*/

var parse = require('url').parse;

function getHostname(url){
    return parse(url).hostname;
}

module.exports = function getAbstractGraphHostnames(graph){
    var nodes = graph.nodes;
    var hostnames = new Set();
    
    nodes.forEach(function(res){
        if(typeof res.expression_id === 'number')
            hostnames.add(getHostname(res.url));
    });
    
    return hostnames;
};
