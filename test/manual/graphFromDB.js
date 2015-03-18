"use strict";

require('../../ES-mess');

var database = require('../../database');

database.complexQueries.getGraphFromRootURIs(URLs).then(function(graph){
    console.log('graph from db', graph.nodes.size, graph.edges.size);
    console.log(graph.exportAsGEXF());
    
}).catch(function(err){
    console.error('problem exporting the graph', err, err.stack)
});