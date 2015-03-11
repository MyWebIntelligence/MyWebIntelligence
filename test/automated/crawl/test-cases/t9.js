"use strict";

require('../../../../ES-mess');

var assert = assert = require('chai').assert;
require('chai-as-promised');
var mockReq = require('mock-require');

mockReq('../../../../crawl/extractEffectiveDocument', '../mocks/extractEffectiveDocument');
mockReq('../../../../crawl/approve', '../mocks/approve'); // always return true

var db = require('../../../../database');

var rootURIsToGraph = require('../rootURIsToGraph');

var webDesc = require('../virtual-web/a.web.json');

var path = "/4"
var roots = ['http://a.web'+path];


describe('(2, 1) graph', function(){
    
    before(function(){ return db.clearAll(); });
    
    it('should return a graph with two nodes and no edge', function(){
        return rootURIsToGraph(new Set(roots))
            .then(function(graph){
                assert.strictEqual(graph.nodes.size, 2, "should have two nodes");
                assert.strictEqual(graph.edges.size, 1, "should have two edges");
                var nodes = graph.nodes._toArray();
            
                assert.ok(nodes[0].url === 'http://a.web/end/2' || nodes[1].url === 'http://a.web/end/2', "One node is /end/2");
                assert.ok(nodes[0].url === roots[0] || nodes[1].url === roots[0], "One node is the root path");
            });
    });
    
    after(function(){
        mockReq.stop('../../../../crawl/extractEffectiveDocument');
        mockReq.stop('../../../../crawl/approve');
        return db.clearAll();
    });
    
});
