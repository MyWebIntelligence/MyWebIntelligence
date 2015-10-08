"use strict";

require('../../../ES-mess');

process.env.NODE_ENV = "test";

var chai = require('chai');
var assert = chai.assert;
chai.use(require('chai-as-promised'));

var instagramHeuristic = require('../../../expressionDomain/heuristics/instagram');

describe('Instagram expression domain heuristics', function(){
    
    it('http://instagram.com/', function(){
        var edNameP = instagramHeuristic.getExpressionDomainName('http://instagram.com/');
        
        return assert.eventually.strictEqual(edNameP, "instagram.com");
    });
    
    it('https://instagram.com/alice_kieffer/', function(){
        var edNameP = instagramHeuristic.getExpressionDomainName('https://instagram.com/alice_kieffer/');
        
        return assert.eventually.strictEqual(edNameP, "instagram/alice_kieffer");
    });
    
    it('https://instagram.com/p/52yI4XPM3i/', function(){
        var edNameP = instagramHeuristic.getExpressionDomainName('https://instagram.com/p/52yI4XPM3i/');
        
        return assert.eventually.strictEqual(edNameP, "instagram/alice_kieffer");
    });
    
        
    it('Invalid URLs', function(){
        return Promise.all([
            // no known invalid URLs at this point
        ].map(function(url){
            var edNameP = twitterHeuristics.getExpressionDomainName(url);
            
            return assert.isRejected(edNameP, url+' should be an invalid URL for the Slideshare heuristics');
        }));
        
    });
    
});