"use strict";

require('../../../ES-mess');

process.env.NODE_ENV = "test";

var chai = require('chai');
var assert = chai.assert;
chai.use(require('chai-as-promised'));

var dailymotionHeuristic = require('../../../expressionDomain/heuristics/dailymotion');

describe('Dailymotion expression domain heuristics', function(){
    
    it('http://www.dailymotion.com/', function(){
        var edNameP = dailymotionHeuristic.getExpressionDomainName('http://www.dailymotion.com/');
        
        return assert.eventually.strictEqual(edNameP, "dailymotion.com");
    });
    
    it('http://www.dailymotion.com/video/x1eyk1_guru-mc-solaar-le-bien-le-mal_music', function(){
        var edNameP = dailymotionHeuristic.getExpressionDomainName('http://www.dailymotion.com/video/x1eyk1_guru-mc-solaar-le-bien-le-mal_music');
        
        return assert.eventually.strictEqual(edNameP, "dailymotion/PeteRock");
    });
    
    it('http://www.dailymotion.com/PeteRock', function(){
        var edNameP = dailymotionHeuristic.getExpressionDomainName('http://www.dailymotion.com/PeteRock');
        
        return assert.eventually.strictEqual(edNameP, "dailymotion/PeteRock");
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