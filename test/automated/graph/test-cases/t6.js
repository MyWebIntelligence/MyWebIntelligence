"use strict";

require('../../../../ES-mess');

process.env.NODE_ENV = "test";

var assert = assert = require('chai').assert;
require('chai-as-promised');

var db = require('../../../../database/index.js');
var dropAllTables = require('../../../../database/management/dropAllTables');
var createTables = require('../../../../database/management/createTables');

var deleteAllResources = db.Resources.deleteAll.bind(db.Resources);

var roots = [
    "https://github.com/MyWebIntelligence/MyWebIntelligence",
    "https://www.youtube.com/watch?v=Y8i1Ddj1Sw8"
];

describe('Complex Queries: getGraphFromRootURIs - (2, 1) graph', function(){
    
    before(function(){
        return dropAllTables()
            .then(createTables)
            .then(function(){
                return db.Resources.create(new Set(roots))
                    .then(function(rs){
                        return Promise.all(rs.map(function(r){
                            return db.Expressions.create({
                                title: 'TITLE '+r.url
                            }).then(function(expressionsIds){
                                var expressionId = expressionsIds[0].id;
                                return db.Resources.associateWithExpression(r.id, expressionId);
                            });
                        }))
                            .then(function(){ return rs; });
                    })
                    .then(function(rs){
                        var r0 = rs.find(function(r){ return r.url === roots[0] });
                        var r1 = rs.find(function(r){ return r.url === roots[1] });
                    
                        return db.Links.create([
                            {
                                source: r0.id,
                                target: r1.id
                            }
                        ]);
                    });
            });
    });
    
    it('should return a graph with 2 nodes and 1 edge', function(){
        return db.complexQueries.getGraphFromRootURIs(new Set(roots))
            .then(function(graph){
                assert.strictEqual(graph.nodes.size(), 2, "should have two nodes");
                var nodes = graph.nodes.values();
                
                assert.ok(nodes.some(function(n){ return n.url === roots[0]; }), 'one node has '+roots[0]+' as url');
                assert.ok(nodes.some(function(n){ return n.url === roots[1]; }), 'one node has '+roots[1]+' as url');
            
                assert.strictEqual(graph.edges.size, 1, "should have one edge");
                var edge = graph.edges.toJSON()[0];
            
                assert.ok(nodes.some(function(n){ console.log('source', n.id, edge.source); return n.id === edge.source; }), "correct source resourceId");
                assert.ok(nodes.some(function(n){ return n.id === edge.target; }), "correct target resourceId");
            });
    });
    
});
