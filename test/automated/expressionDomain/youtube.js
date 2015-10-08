"use strict";

require('../../../ES-mess');

process.env.NODE_ENV = "test";

var chai = require('chai');
var assert = chai.assert;
chai.use(require('chai-as-promised'));

var youtubeHeuristics = require('../../../expressionDomain/heuristics/youtube');

describe('Youtube expression domain heuristics', function(){
    
    it('http://www.youtube.com/', function(){
        var edNameP = youtubeHeuristics.getExpressionDomainName('http://www.youtube.com/');
        
        return assert.eventually.strictEqual(edNameP, "youtube.com");
    });
    
    it('http://www.youtube.com/channel/UCBX9Yj5UjuXb5cDmPD4ZaWg?feature=mhee', function(){
        var edNameP = youtubeHeuristics.getExpressionDomainName('http://www.youtube.com/channel/UCBX9Yj5UjuXb5cDmPD4ZaWg?feature=mhee');
        
        return assert.eventually.strictEqual(edNameP, "youtube/channel/UCBX9Yj5UjuXb5cDmPD4ZaWg");
    });
    
    it('http://www.youtube.com/heartandstrokefdn', function(){
        var edNameP = youtubeHeuristics.getExpressionDomainName('http://www.youtube.com/heartandstrokefdn');
        
        return assert.eventually.strictEqual(edNameP, "youtube/heartandstrokefdn");
    });
    
    it('http://www.youtube.com/user/ASAveterinaria', function(){
        var edNameP = youtubeHeuristics.getExpressionDomainName('http://www.youtube.com/user/ASAveterinaria');
        
        return assert.eventually.strictEqual(edNameP, "youtube/ASAveterinaria");
    });
    
    it('http://www.youtube.com/user/hypertensioncanada?feature=results_main', function(){
        var edNameP = youtubeHeuristics.getExpressionDomainName('http://www.youtube.com/user/hypertensioncanada?feature=results_main');
        
        return assert.eventually.strictEqual(edNameP, "youtube/hypertensioncanada");
    });
    
    it('http://www.youtube.com/watch?v=L2GqLQiRivE', function(){
        var edNameP = youtubeHeuristics.getExpressionDomainName('http://www.youtube.com/watch?v=L2GqLQiRivE');
        
        return assert.eventually.strictEqual(edNameP, "youtube/Docteur Safia Taieb");
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