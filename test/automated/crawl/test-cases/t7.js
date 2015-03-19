"use strict";

require('../../../../ES-mess');

var assert = assert = require('chai').assert;
require('chai-as-promised');
var mockReq = require('mock-require');

mockReq('../../../../crawl/approve', '../mocks/approve'); // always return true

var db = require('../../../../database');

var rootURIsToGraph = require('../rootURIsToGraph');

var webDesc = require('../virtual-web/a.web.json');
var path = "/1";

var roots = ['http://a.web'+path];


describe('(2, 1) graph', function(){
    
    before(function(){ return db.clearAll(); });
    
    it('should return a (2, 1) graph', function(){
        return rootURIsToGraph(new Set(roots))
            .then(function(graph){
                assert.strictEqual(graph.nodes.size, 2, "should have two nodes");
                assert.strictEqual(graph.edges.size, 1, "should have one edge");
                var edge = graph.edges._toArray()[0];
            
                assert.strictEqual(edge.node1.url, roots[0], "correct source URL");
                assert.strictEqual(edge.node2.url, 'http://a.web'+webDesc[path][0], "correct target URL");
            });
    });
    
    after(function(){
        mockReq.stop('../../../../crawl/approve');
        return db.clearAll();
    });
    
});
