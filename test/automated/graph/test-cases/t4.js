"use strict";

require('../../../../ES-mess');

process.env.NODE_ENV = "test";

var assert = assert = require('chai').assert;
require('chai-as-promised');

var db = require('../../../../database/index.js');
var dropAllTables = require('../../../../database/management/dropAllTables');
var createTables = require('../../../../database/management/createTables');

var deleteAllResources = db.Resources.deleteAll.bind(db.Resources);

var sourceURL = 'http://a.web/source';
var targetURL = 'http://a.web/target';

describe('Complex Queries: getGraphFromRootURIs - 1 Query result redirects to a resource with expression - (1, 0) graph', function(){
    
    before(function(){
        return dropAllTables()
            .then(createTables)
            .then(function(){
                // query result
                return db.Resources.create(new Set([sourceURL]))
                    .then(function(resourcesIds){
                        return resourcesIds[0].id;
                    });
            })
            .then(function(rid){
                return db.Resources.addAlias(rid, targetURL);
            })
            .then(function(targetResourceId){
                return db.Expressions.create([{
                        title: 'TITLE'
                    }])
                    .then(function(expressionsIds){
                        var expressionId = expressionsIds[0].id;
                        return db.Resources.associateWithExpression(targetResourceId, expressionId);
                    })
            });
    });
    
    it('should return a graph with no node and no edge', function(){
        return db.complexQueries.getGraphFromRootURIs(new Set([sourceURL]))
            .then(function(graph){
                assert.strictEqual(graph.nodes.size(), 1, "should have one node");
                var node;
                graph.nodes.forEach(function(n){
                    node = n;
                });
                assert.strictEqual(node.url, targetURL, "should have the target URL");
                assert.strictEqual(node.depth, 0, "should have depth 0");
                assert.strictEqual(graph.edges.size, 0, "should have no edge");
            });
    });
    
});
