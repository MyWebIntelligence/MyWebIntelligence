"use strict";

require('../../../../ES-mess');

var assert = assert = require('chai').assert;
require('chai-as-promised');
var mockReq = require('mock-require');

mockReq('../../../../crawl/approve', '../mocks/approve'); // always return true

var db = require('../../../../database');

var rootURIsToGraph = require('../rootURIsToGraph');


var roots = [];


describe('Zero graph', function(){
    
    before(function(){ return db.clearAll(); });
    
    it('should return a graph with no node and no edge', function(){
        return rootURIsToGraph(new Set(roots))
            .then(function(graph){
                assert.strictEqual(graph.nodes.size, 0, "should have no node");
                assert.strictEqual(graph.edges.size, 0, "should have no edge");
            });
    });
    
    after(function(){
        mockReq.stop('../../../../crawl/approve');
        
        return db.clearAll();
    });
    
});
