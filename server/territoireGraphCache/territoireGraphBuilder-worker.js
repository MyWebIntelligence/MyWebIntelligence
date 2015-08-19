"use strict";

process.title = "MyWI territoireGraphBuilder-worker";

require('../../ES-mess');

var database = require('../../database');


console.log('MyWI territoireGraphBuilder-worker args');
process.argv.forEach(function(val, i) {
    console.log(i, val);
});

var territoireId = Number(process.argv[2]);

database.complexQueries.getTerritoireGraph(territoireId)
    .then(function(graph){
        process.send(graph);
    })
    .catch(function(err){
        console.error("MyWI territoireGraphBuilder-worker error", territoireId, err, err.stack);
        process.kill();
    });
