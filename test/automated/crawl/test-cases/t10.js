"use strict";

require('../../../../ES-mess');

var assert = assert = require('chai').assert;
require('chai-as-promised');
var mockReq = require('mock-require');

mockReq('../../../../crawl/approve', '../mocks/approve'); // always return true

var db = require('../../../../database');

var rootURIsToGraph = require('../rootURIsToGraph');

var webDesc = require('../virtual-web/a.web.json');
var path = "/5";

var roots = ['http://a.web'+path];


describe('(3, 2) graph', function(){
    
    before(function(){ return db.clearAll(); });
    
    it('should return a (3, 2) graph', function(){
        return rootURIsToGraph(new Set(roots))
            .then(function(graph){
                assert.strictEqual(graph.nodes.size, 3, "should have 3 nodes");
                assert.strictEqual(graph.edges.size, 2, "should have 2 edges");
                var nodes = graph.nodes._toArray();
                assert.ok(nodes.find(function(n){
                    return n.url === roots[0]
                }), "One node is "+roots[0]);
                assert.ok(nodes.find(function(n){
                    return n.url === 'http://a.web/end/6'
                }), "One node is "+'http://a.web/end/6');
                assert.ok(nodes.find(function(n){
                    return n.url === 'http://a.web/end/7'
                }), "One node is "+'http://a.web/end/7');
            
            });
    });
    
    after(function(){
        mockReq.stop('../../../../crawl/approve');
        return db.clearAll();
    });
    
});
