"use strict";

require('../../../ES-mess');

process.env.NODE_ENV = "test";

var chai = require('chai');
var assert = chai.assert;
chai.use(require('chai-as-promised'));

var vimeoHeuristic = require('../../../expressionDomain/heuristics/vimeo');

describe('Vimeo expression domain heuristics', function(){
    
    it('http://www.vimeo.com/', function(){
        var edNameP = vimeoHeuristic.getExpressionDomainName('http://www.vimeo.com/');
        
        return assert.eventually.strictEqual(edNameP, "vimeo.com");
    });
    
    it('https://vimeo.com/worrydream', function(){
        var edNameP = vimeoHeuristic.getExpressionDomainName('https://vimeo.com/worrydream');
        
        return assert.eventually.strictEqual(edNameP, "vimeo/worrydream");
    });
    
    it('https://vimeo.com/115154289', function(){
        var edNameP = vimeoHeuristic.getExpressionDomainName('https://vimeo.com/115154289');
        
        return assert.eventually.strictEqual(edNameP, "vimeo/Bret Victor");
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