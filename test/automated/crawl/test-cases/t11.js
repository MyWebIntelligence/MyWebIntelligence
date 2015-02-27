"use strict";

console.log('simplest')

require('../../../../ES-mess');

var assert = assert = require('chai').assert;
require('chai-as-promised');
var mockReq = require('mock-require');

mockReq('../../../../crawl/extractEffectiveDocument', '../mocks/extractEffectiveDocument');

var db = require('../../../../database');

var rootURIsToGraph = require('../rootURIsToGraph');

var webDesc = require('../virtual-web/a.web.json');
var path = "/6";

var roots = ['http://a.web'+path];


describe('(3, 2) graph', function(){
    
    before(function(){ return db.clearAll(); });
    
    it('should return a (3, 2) graph', function(){
        return rootURIsToGraph(new Set(roots))
            .then(function(graph){
                assert.strictEqual(graph.nodes.size, 3, "should have 3 nodes");
                assert.strictEqual(graph.edges.size, 2, "should have 2 edges");
                var nodes = graph.nodes._toArray();
                assert.ok(nodes.indexOf(roots[0]) !== -1, "One node is "+roots[0]);
                assert.ok(nodes.indexOf('http://a.web/7') !== -1, "One node is "+'http://a.web/7');
                assert.ok(nodes.indexOf('http://a.web/end/8') !== -1, "One node is "+'http://a.web/end/8');
            
            });
    });
    
    after(function(){
        mockReq.stop('../../../../crawl/extractEffectiveDocument');
        return db.clearAll();
    });
    
});
