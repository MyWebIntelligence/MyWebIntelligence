"use strict";

require('../../ES-mess');

var database = require('../../database');

var URLs = new Set([
    /*'http://en.wikipedia.org/wiki/List_of_HTTP_status_codes',
    'https://t.co/MVaH9yUPSy',
    'https://linkurio.us/graph-viz-101/',*/
    'http://thinkaurelius.github.io/titan/',
    //'http://en.wikipedia.org/wiki/Graph_%28abstract_data_type%29'
]);


database.complexQueries.getGraphFromRootURIs(URLs).then(function(graph){
    console.log('graph from db', graph.nodes.size, graph.edges.size);
    console.log(graph.exportAsGEXF());
    
}).catch(function(err){
    console.error('problem exporting the graph', err, err.stack)
});