"use strict";

require('../../../ES-mess');

process.env.NODE_ENV = "test";

var chai = require('chai');
var assert = chai.assert;
chai.use(require('chai-as-promised'));

var twitterHeuristics = require('../../../expressionDomain/heuristics/twitter');

describe('Twitter expression domain heuristics', function(){
    
    it('http://twitter.com/doajplus', function(){
        var edNameP = twitterHeuristics.getExpressionDomainName('http://twitter.com/doajplus');
        
        return assert.eventually.strictEqual(edNameP, "twitter/doajplus");
    });
    
    it('http://www.twitter.com/Dailymotion', function(){
        var edNameP = twitterHeuristics.getExpressionDomainName('http://www.twitter.com/Dailymotion');
        
        return assert.eventually.strictEqual(edNameP, "twitter/Dailymotion");
    });
    
    it('https://mobile.twitter.com/AudreyFievre?p=i', function(){
        var edNameP = twitterHeuristics.getExpressionDomainName('https://mobile.twitter.com/AudreyFievre?p=i');
        
        return assert.eventually.strictEqual(edNameP, "twitter/AudreyFievre");
    });
    
    it('https://twitter.com/hashtag/esante', function(){
        var edNameP = twitterHeuristics.getExpressionDomainName('https://twitter.com/hashtag/esante');
        
        return assert.eventually.strictEqual(edNameP, "twitter/search");
    });
    
    it('https://twitter.com/search?q=%23Hollande&src=hash', function(){
        var edNameP = twitterHeuristics.getExpressionDomainName('https://twitter.com/search?q=%23Hollande&src=hash');
        
        return assert.eventually.strictEqual(edNameP, "twitter/search");
    });
    
    it('https://twitter.com/', function(){
        var edNameP = twitterHeuristics.getExpressionDomainName('https://twitter.com/');
        
        return assert.eventually.strictEqual(edNameP, "twitter.com");
    });
    
    it('https://twitter.com/amarlakel/status/609001132522909696', function(){
        var edNameP = twitterHeuristics.getExpressionDomainName('https://twitter.com/amarlakel/status/609001132522909696');
        
        return assert.eventually.strictEqual(edNameP, "twitter/amarlakel");
    });
    
        
    it('Invalid URLs', function(){
        return Promise.all([
            // no known invalid URLs at this point
        ].map(function(url){
            var edNameP = twitterHeuristics.getExpressionDomainName(url);
            
            return assert.isRejected(edNameP, url+' should be an invalid URL for the Facebook heuristics');
        }));
        
    });
    
});