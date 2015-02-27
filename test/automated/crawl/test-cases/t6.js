"use strict";

console.log('simplest')

require('../../../../ES-mess');

var assert = assert = require('chai').assert;
require('chai-as-promised');
var mockReq = require('mock-require');

mockReq('../../../../crawl/extractEffectiveDocument', '../mocks/extractEffectiveDocument');
mockReq('../../../../crawl/approve', '../mocks/approve'); // always return true

var db = require('../../../../database');

var rootURIsToGraph = require('../rootURIsToGraph');


var roots = ['http://a.web/end/1', 'http://a.web/end/2'];


describe('(2, 0) graph', function(){
    
    before(function(){ return db.clearAll(); });
    
    it('should return a graph with two nodes and no edge', function(){
        return rootURIsToGraph(new Set(roots))
            .then(function(graph){
                assert.strictEqual(graph.nodes.size, 2, "should have two nodes");
                assert.strictEqual(graph.edges.size, 0, "should have no edge");
                var oneNode = graph.nodes._toArray()[0];
            
                assert.ok(oneNode === roots[0] || oneNode === roots[1], "node should have the correct URL");
            });
    });
    
    after(function(){
        mockReq.stop('../../../../crawl/extractEffectiveDocument');
        mockReq.stop('../../../../crawl/approve');
        return db.clearAll();
    });
    
});
