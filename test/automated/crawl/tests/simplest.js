"use strict";

require('../../../../ES-mess');

var assert = assert = require('chai').assert;
require('chai-as-promised');

var db = require('../../../../database');

var crawl = require('../../../../crawl');
var persistCrawlResult = require('../../../../crawl/persistCrawlResult');

function cleanDB(){
    var deleteAllFunctions = Object.keys(db)
        .map(function(k){
            if(typeof db[k].deleteAll === 'function')
                return db[k].deleteAll.bind(db[k]);
        })
        .filter(function(v){ return !!v; });
    
    return Promise.all(deleteAllFunctions.map(function(f){ return f(); }));
}



var roots = ['http://a.web/index.html'];

describe('Simplest graph', function(){
    
    before(function(){
    
        
        return cleanDB();
    });
    
    it('should return a graph with one node and no edge', function(){
        return crawl(new Set(roots))
            .then(persistCrawlResult)
            .then(function(){
                return db.complexQueries.getGraphFromRootURIs(new Set(roots));
            })
            .then(function(graph){
                console.log('graph', typeof graph);
                assert.strictEqual(graph.nodes.size, 1, "should have one node");
                assert.strictEqual(graph.edges.size, 0, "should have no edge");
                assert.strictEqual(graph.nodes._toArray()[0], roots[0], "node should have the correct URL");
            });
    });
    
    after(function(){
        return cleanDB();
    });
    
});
