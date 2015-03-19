"use strict";

require('../../../../ES-mess');

var assert = assert = require('chai').assert;
require('chai-as-promised');
var mockReq = require('mock-require');

mockReq('../../../../crawl/approve', '../mocks/approve'); // always return true

var db = require('../../../../database');

var rootURIsToGraph = require('../rootURIsToGraph');

var endLocation = "http://a.web/end/3"
var redirectLocation = "http://a.web/2?redirect=301&location="+encodeURIComponent(endLocation);
var roots = ['http://a.web/1?redirect=301&location='+encodeURIComponent(redirectLocation)];


describe('Graph with one URL with 2 conseq 301 redirects', function(){
    
    before(function(){ return db.clearAll(); });
    
    it('should return a graph with one node and no edge (after redirect)', function(){
        return rootURIsToGraph(new Set(roots))
            .then(function(graph){
                assert.strictEqual(graph.nodes.size, 1, "should have one node");
                assert.strictEqual(graph.edges.size, 0, "should have no edge");
                assert.strictEqual(graph.nodes._toArray()[0].url, endLocation, "node should have the correct URL");
            });
    });
    
    after(function(){
        mockReq.stop('../../../../crawl/approve');
        return db.clearAll();
    });
    
});
