"use strict";

console.log('simplest')

require('../../../../ES-mess');

var assert = assert = require('chai').assert;
require('chai-as-promised');
var mockReq = require('mock-require');

mockReq('../../../../crawl/extractEffectiveDocument', '../mocks/extractEffectiveDocument');

var db = require('../../../../database');

var rootURIsToGraph = require('../rootURIsToGraph');

var linksTo = 'http://a.web/2';
var roots = ['http://a.web/1?links='+encodeURI(linksTo)];


describe('(2, 1) graph', function(){
    
    before(function(){ return db.clearAll(); });
    
    it('should return a (2, 1) graph', function(){
        return rootURIsToGraph(new Set(roots))
            .then(function(graph){
                assert.strictEqual(graph.nodes.size, 2, "should have two nodes");
                assert.strictEqual(graph.edges.size, 1, "should have one edge");
                var edge = graph.edges._toArray()[0];
                assert.strictEqual(edge.source, roots[0], "correct source URL");
                assert.strictEqual(edge.target, linksTo, "correct target URL");
            });
    });
    
    after(function(){
        mockReq.stop('../../../../crawl/extractEffectiveDocument');
        return db.clearAll();
    });
    
});
