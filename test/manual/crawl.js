"use strict";

require('../../ES-mess');

var database = require('../../database');

var rootURIsToGraph = require('../automated/crawl/rootURIsToGraph');

var URLs = new Set([
    /*'http://en.wikipedia.org/wiki/List_of_HTTP_status_codes',
    'https://t.co/MVaH9yUPSy',
    'https://linkurio.us/graph-viz-101/',*/
    'http://thinkaurelius.github.io/titan/',
    //'http://en.wikipedia.org/wiki/Graph_%28abstract_data_type%29'
]);

var keywords = new Set(['graph']);

//database.Expressions.deleteAll().then(function(){
    rootURIsToGraph(URLs, keywords)
        .then(function(graph){
            console.log('rootURIsToGraph result', graph.nodes.size, graph.edges.size);

            console.log(graph.exportAsGEXF());
        })
        .catch(function(err){
            console.error('rootURIsToGraph error', err, err.stack);
        });
        
//})



