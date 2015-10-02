"use strict";

require('../../../ES-mess');

process.env.NODE_ENV = "test";

var chai = require('chai');
var assert = chai.assert;
chai.use(require('chai-as-promised'));

var facebookHeuristic = require('../../../expressionDomain/heuristics/facebook');
var twitterHeuristic = require('../../../expressionDomain/heuristics/twitter');
var linkedinHeuristic = require('../../../expressionDomain/heuristics/linkedin');
var defaultHeuristic = require('../../../expressionDomain/heuristics/default');

var getRelevantHeuristic = require('../../../expressionDomain/getRelevantHeuristic');

describe('getRelevantHeuristic', function(){
    
    it('http://facebook.com/pages/Sciences-et-Avenir/194705390569710 => Facebook', function(){
        var h = getRelevantHeuristic('http://facebook.com/pages/Sciences-et-Avenir/194705390569710');
        
        return assert.strictEqual(h, facebookHeuristic);
    });
    
    it('http://fr-fr.facebook.com/mymsa => Facebook', function(){
        var h = getRelevantHeuristic('http://fr-fr.facebook.com/mymsa');
        
        return assert.strictEqual(h, facebookHeuristic);
    });
    
    it('https://developers.facebook.com/?ref=pf => Default', function(){
        var h = getRelevantHeuristic('https://developers.facebook.com/?ref=pf');
        
        return assert.strictEqual(h, defaultHeuristic);
    });
    
    it('https://github.com/MyWebIntelligence/MyWebIntelligence => Default', function(){
        var h = getRelevantHeuristic('https://github.com/MyWebIntelligence/MyWebIntelligence');
        
        return assert.strictEqual(h, defaultHeuristic);
    });
    
    it('https://twitter.com/MozDevNet/status/649599676308590592 => Twitter', function(){
        var h = getRelevantHeuristic('https://twitter.com/MozDevNet/status/649599676308590592');
        
        return assert.strictEqual(h, twitterHeuristic);
    });
    
    it('https://mobile.twitter.com/yo => Twitter', function(){
        var h = getRelevantHeuristic('https://twitter.com/MozDevNet/status/649599676308590592');
        
        return assert.strictEqual(h, twitterHeuristic);
    });
    
    it('https://www.linkedin.com/company/1004390 => Linkedin', function(){
        var h = getRelevantHeuristic('https://www.linkedin.com/company/1004390');
        
        return assert.strictEqual(h, linkedinHeuristic);
    });
    
    it('http://fr.linkedin.com/pub/dir/+/Lakel => Linkedin', function(){
        var h = getRelevantHeuristic('http://fr.linkedin.com/pub/dir/+/Lakel');
        
        return assert.strictEqual(h, linkedinHeuristic);
    });
    
    
    it('https://www.youtube.com/watch?v=JGhoLcsr8GA => Default (soon Youtube)', function(){
        var h = getRelevantHeuristic('https://www.youtube.com/watch?v=JGhoLcsr8GA');
        
        return assert.strictEqual(h, defaultHeuristic);
    });
    
});

// https://developers.facebook.com/?ref=pf => 'developers.facebook.com' (default)