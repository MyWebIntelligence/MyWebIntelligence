"use strict";

require('../../../../ES-mess');

process.env.NODE_ENV = "test";

var assert = assert = require('chai').assert;
require('chai-as-promised');

var db = require('../../../../database/index.js');
var dropAllTables = require('../../../../postgresDB/dropAllTables');
var createTables = require('../../../../postgresDB/createTables');

var deleteAllResources = db.Resources.deleteAll.bind(db.Resources);

var roots = [
    "https://github.com/MyWebIntelligence/MyWebIntelligence"
];

describe('Complex Queries: getGraphFromRootURIs - 1 Query result with no expression returns a (0, 0) graph', function(){
    
    before(function(){
        return dropAllTables()
            .then(createTables)
            .then(function(){
                return db.Resources.create(new Set(roots))
            });
    });
    
    it('should return a graph with no node and no edge', function(){
        return db.complexQueries.getGraphFromRootURIs(new Set(roots))
            .then(function(graph){
                assert.strictEqual(graph.nodes.size(), 0, "should have one node");
                assert.strictEqual(graph.edges.size, 0, "should have no edge");
            });
    });
    
});