"use strict";

require('../../ES-mess');

var database = require('../../database');
var pageGraphToDomainGraph = require('../../common/graph/pageGraphToDomainGraph');

var URLs = new Set([
    /*'http://en.wikipedia.org/wiki/List_of_HTTP_status_codes',
    'https://t.co/MVaH9yUPSy',
    'https://linkurio.us/graph-viz-101/',*/
    'http://thinkaurelius.github.io/titan/',
    //'http://en.wikipedia.org/wiki/Graph_%28abstract_data_type%29'
]);


database.complexQueries.getGraphFromRootURIs(URLs).then(function(pageGraph){
    console.log('pageGraph from db', pageGraph.nodes.size, pageGraph.edges.size);
    console.log(pageGraph.exportAsGEXF());
    
    return pageGraphToDomainGraph(pageGraph).then(function(domainGraph){
        console.log('\n\ndomainGraph from db', domainGraph.nodes.size, domainGraph.edges.size);
        console.log(domainGraph.exportAsGEXF());
    });
    
}).catch(function(err){
    console.error('problem exporting the graph', err, err.stack)
});