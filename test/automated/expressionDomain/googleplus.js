"use strict";

require('../../../ES-mess');

process.env.NODE_ENV = "test";

var chai = require('chai');
var assert = chai.assert;
chai.use(require('chai-as-promised'));

var googlePlusHeuristic = require('../../../expressionDomain/heuristics/googleplus');

describe('Google+ expression domain heuristics', function(){
    
    it('https://plus.google.com/', function(){
        var edNameP = googlePlusHeuristic.getExpressionDomainName('https://plus.google.com/');
        
        return assert.eventually.strictEqual(edNameP, "plus.google.com");
    });
    
    it('https://plus.google.com/+1226digital/posts/iqV9xmRr35z', function(){
        var edNameP = googlePlusHeuristic.getExpressionDomainName('https://plus.google.com/+1226digital/posts/iqV9xmRr35z');
        
        return assert.eventually.strictEqual(edNameP, "Google+/+1226digital");
    });
    
    it('https://plus.google.com/+2D2Comunicaci%C3%B3nAlicante', function(){
        var edNameP = googlePlusHeuristic.getExpressionDomainName('https://plus.google.com/+2D2Comunicaci%C3%B3nAlicante');
        
        return assert.eventually.strictEqual(edNameP, "Google+/+2D2ComunicaciónAlicante");
    });
    
    it('https://plus.google.com/+ABSocialMedia00/videos', function(){
        var edNameP = googlePlusHeuristic.getExpressionDomainName('https://plus.google.com/+ABSocialMedia00/videos');
        
        return assert.eventually.strictEqual(edNameP, "Google+/+ABSocialMedia00");
    });
    
    it('https://plus.google.com/+Glowsocialmedia/about', function(){
        var edNameP = googlePlusHeuristic.getExpressionDomainName('https://plus.google.com/+Glowsocialmedia/about');
        
        return assert.eventually.strictEqual(edNameP, "Google+/+Glowsocialmedia");
    });
    
    it('https://plus.google.com/100128576451029402431', function(){
        var edNameP = googlePlusHeuristic.getExpressionDomainName('https://plus.google.com/100128576451029402431');
        
        return assert.eventually.strictEqual(edNameP, "Google+/100128576451029402431");
    });
    
    it('https://plus.google.com/100896917030455742495/about', function(){
        var edNameP = googlePlusHeuristic.getExpressionDomainName('https://plus.google.com/100896917030455742495/about');
        
        return assert.eventually.strictEqual(edNameP, "Google+/100896917030455742495");
    });
    
    it('https://plus.google.com/collection/A4-KAB', function(){
        var edNameP = googlePlusHeuristic.getExpressionDomainName('https://plus.google.com/collection/A4-KAB');
        
        return assert.eventually.strictEqual(edNameP, "Google+/collection/A4-KAB");
    });
    
    it('https://plus.google.com/collection/sivre', function(){
        var edNameP = googlePlusHeuristic.getExpressionDomainName('https://plus.google.com/collection/sivre');
        
        return assert.eventually.strictEqual(edNameP, "Google+/collection/sivre");
    });
    
    it('https://plus.google.com/communities/100250373099590631205/stream/bca6eb89-ffc7-406c-a6b8-2686542d45af', function(){
        var edNameP = googlePlusHeuristic.getExpressionDomainName('https://plus.google.com/communities/100250373099590631205/stream/bca6eb89-ffc7-406c-a6b8-2686542d45af');
        
        return assert.eventually.strictEqual(edNameP, "Google+/communities/100250373099590631205");
    });
    
    it('https://plus.google.com/communities/100354381402619402956', function(){
        var edNameP = googlePlusHeuristic.getExpressionDomainName('https://plus.google.com/communities/100354381402619402956');
        
        return assert.eventually.strictEqual(edNameP, "Google+/communities/100354381402619402956");
    });
    
    it('https://plus.google.com/events/c9gm7r6v7i7bvmsf7ath877aeb4', function(){
        var edNameP = googlePlusHeuristic.getExpressionDomainName('https://plus.google.com/events/c9gm7r6v7i7bvmsf7ath877aeb4');
        
        return assert.eventually.strictEqual(edNameP, "Google+/events/c9gm7r6v7i7bvmsf7ath877aeb4");
    });
    
    
        
    it('Invalid URLs', function(){
        return Promise.all([
            'https://plus.google.com/app/basic/102657414620214529142/posts?cbp=13gakcdnuy905&sview=28&cid=5&soc-app=115&soc-platform=1&spath=/app/basic/s&sparm=cbp%3D1wmyu24jukd4b%26sview%3D28%26sq%3DMicrosoft%26sc%3Dpo'
        ].map(function(url){
            var edNameP = googlePlusHeuristic.getExpressionDomainName(url);
            
            return assert.isRejected(edNameP, url+' should be an invalid URL for the Slideshare heuristics');
        }));
        
    });
    
});