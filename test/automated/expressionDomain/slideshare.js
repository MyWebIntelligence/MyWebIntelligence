"use strict";

require('../../../ES-mess');

process.env.NODE_ENV = "test";

var chai = require('chai');
var assert = chai.assert;
chai.use(require('chai-as-promised'));

var slideshareHeuristics = require('../../../expressionDomain/heuristics/slideshare');

describe('Slideshare expression domain heuristics', function(){
    
    it('http://www.slideshare.net/doaj/', function(){
        var edNameP = slideshareHeuristics.getExpressionDomainName('http://www.slideshare.net/doaj/');
        
        return assert.eventually.strictEqual(edNameP, "slideshare/doaj");
    });
    
    it('http://www.slideshare.net/emnahammami/arthrite-septique-de-lenfant?smtNoRedir=1', function(){
        var edNameP = slideshareHeuristics.getExpressionDomainName('http://www.slideshare.net/emnahammami/arthrite-septique-de-lenfant?smtNoRedir=1');
        
        return assert.eventually.strictEqual(edNameP, "slideshare/emnahammami");
    });
    
    it('http://de.slideshare.net/emnahammami/arthrite-septique-de-lenfant', function(){
        var edNameP = slideshareHeuristics.getExpressionDomainName('http://de.slideshare.net/emnahammami/arthrite-septique-de-lenfant');
        
        return assert.eventually.strictEqual(edNameP, "slideshare/emnahammami");
    });
    
    it('http://es.slideshare.net/emnahammami/arthrite-septique-de-lenfant', function(){
        var edNameP = slideshareHeuristics.getExpressionDomainName('http://es.slideshare.net/emnahammami/arthrite-septique-de-lenfant');
        
        return assert.eventually.strictEqual(edNameP, "slideshare/emnahammami");
    });
    
    it('http://fr.slideshare.net/emnahammami/arthrite-septique-de-lenfant', function(){
        var edNameP = slideshareHeuristics.getExpressionDomainName('http://fr.slideshare.net/emnahammami/arthrite-septique-de-lenfant');
        
        return assert.eventually.strictEqual(edNameP, "slideshare/emnahammami");
    });
    
    it('http://fr.slideshare.net/about', function(){
        var edNameP = slideshareHeuristics.getExpressionDomainName('http://fr.slideshare.net/about');
        
        return assert.eventually.strictEqual(edNameP, "slideshare.net");
    });
    
    it('http://fr.slideshare.net/privacy', function(){
        var edNameP = slideshareHeuristics.getExpressionDomainName('http://fr.slideshare.net/privacy');
        
        return assert.eventually.strictEqual(edNameP, "slideshare.net");
    });
    
    it('http://fr.slideshare.net/terms', function(){
        var edNameP = slideshareHeuristics.getExpressionDomainName('http://fr.slideshare.net/terms');
        
        return assert.eventually.strictEqual(edNameP, "slideshare.net");
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