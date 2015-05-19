"use strict";

require('../../../../ES-mess');

process.env.NODE_ENV = "test";

var assert = assert = require('chai').assert;
require('chai-as-promised');

var db = require('../../../../database/index.js');
var dropAllTables = require('../../../../postgresDB/dropAllTables');
var createTables = require('../../../../postgresDB/createTables');

var deleteAllResources = db.Resources.deleteAll.bind(db.Resources);

var roots = [];

describe('Complex Queries: getGraphFromRootURIs - Zero graph', function(){
    
    before(function(){
        return dropAllTables().then(createTables);
    });
    
    it('should return a graph with no node and no edge', function(){
        return db.complexQueries.getGraphFromRootURIs(new Set(roots))
            .then(function(graph){
                assert.strictEqual(graph.nodes.size(), 0, "should have no node");
                assert.strictEqual(graph.edges.size, 0, "should have no edge");
            });
    });
    
});
