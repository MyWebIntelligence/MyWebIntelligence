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

describe('Complex Queries: getGraphFromRootURIs - (1, 0) graph', function(){
    
    before(function(){
        return dropAllTables()
            .then(createTables)
            .then(function(){
                var resourceId;
                var expressionId;
            
                return db.Resources.create(new Set(roots))
                    .then(function(rs){
                        resourceId = rs[0].id;
                    
                        return db.Expressions.create([{
                            title: 'TITLE'
                        }]);
                    })
                    .then(function(expressionsIds){
                        expressionId = expressionsIds[0].id;
                    })
                    .then(function(){
                        return db.Resources.associateWithExpression(resourceId, expressionId);
                    })
                
                ;
            });
    });
    
    it('should return a graph with one node and no edge', function(){
        return db.complexQueries.getGraphFromRootURIs(new Set(roots))
            .then(function(graph){
                assert.strictEqual(graph.nodes.size(), 1, "should have one node");
                assert.strictEqual(graph.edges.size, 0, "should have no edge");
            });
    });
    
});
