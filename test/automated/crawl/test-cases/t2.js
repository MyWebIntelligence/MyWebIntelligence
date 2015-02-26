"use strict";

console.log('simplest')

require('../../../../ES-mess');

var assert = assert = require('chai').assert;
require('chai-as-promised');
var mockReq = require('mock-require');

mockReq('../../../../crawl/extractEffectiveDocument', '../mocks/extractEffectiveDocument');

var db = require('../../../../database');

var rootURIsToGraph = require('../rootURIsToGraph');


var roots = ['http://a.web/1'];


describe('Simplest graph', function(){
    
    before(function(){ return db.clearAll(); });
    
    it('should return a graph with one node and no edge', function(){
        return rootURIsToGraph(new Set(roots))
            .then(function(graph){
                assert.strictEqual(graph.nodes.size, 1, "should have one node");
                assert.strictEqual(graph.edges.size, 0, "should have no edge");
                assert.strictEqual(graph.nodes._toArray()[0], roots[0], "node should have the correct URL");
            });
    });
    
    after(function(){
        mockReq.stop('../../../../crawl/extractEffectiveDocument');
        return db.clearAll();
    });
    
});
