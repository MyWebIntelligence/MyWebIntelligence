"use strict";

require('../../ES-mess');

var rootURIsToGraph = require('../automated/crawl/rootURIsToGraph');

var URLs = new Set([
    /*'http://en.wikipedia.org/wiki/List_of_HTTP_status_codes',
    'https://t.co/MVaH9yUPSy',
    'https://linkurio.us/graph-viz-101/',*/
    'http://thinkaurelius.github.io/titan/',
    //'http://en.wikipedia.org/wiki/Graph_%28abstract_data_type%29'
]);

var keywords = new Set(['graph']);

rootURIsToGraph(URLs, keywords)
    .then(function(graph){
        console.log('crawl result', graph.nodes.size, graph.edges.size);
    
        console.log(graph.exportAsGEXF());
    })
    .catch(function(err){
        console.error('rootURIsToGraph error', err);
    });