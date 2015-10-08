"use strict";

require('../../../ES-mess');

process.env.NODE_ENV = "test";

var chai = require('chai');
var assert = chai.assert;
chai.use(require('chai-as-promised'));

var facebookHeuristic = require('../../../expressionDomain/heuristics/facebook');
var twitterHeuristic = require('../../../expressionDomain/heuristics/twitter');
var linkedinHeuristic = require('../../../expressionDomain/heuristics/linkedin');
var slideshareHeuristic = require('../../../expressionDomain/heuristics/slideshare');
var youtubeHeuristic = require('../../../expressionDomain/heuristics/youtube');
var vimeoHeuristic = require('../../../expressionDomain/heuristics/vimeo');

var defaultHeuristic = require('../../../expressionDomain/heuristics/default');

var getRelevantHeuristic = require('../../../expressionDomain/getRelevantHeuristic');

describe('getRelevantHeuristic', function(){
    
    it('https://developers.facebook.com/?ref=pf => Default', function(){
        var h = getRelevantHeuristic('https://developers.facebook.com/?ref=pf');
        
        return assert.strictEqual(h, defaultHeuristic);
    });
    
    it('https://github.com/MyWebIntelligence/MyWebIntelligence => Default', function(){
        var h = getRelevantHeuristic('https://github.com/MyWebIntelligence/MyWebIntelligence');
        
        return assert.strictEqual(h, defaultHeuristic);
    });
    
    it('http://facebook.com/pages/Sciences-et-Avenir/194705390569710 => Facebook', function(){
        var h = getRelevantHeuristic('http://facebook.com/pages/Sciences-et-Avenir/194705390569710');
        
        return assert.strictEqual(h, facebookHeuristic);
    });
    
    it('http://fr-fr.facebook.com/mymsa => Facebook', function(){
        var h = getRelevantHeuristic('http://fr-fr.facebook.com/mymsa');
        
        return assert.strictEqual(h, facebookHeuristic);
    });
    
    it('https://twitter.com/MozDevNet/status/649599676308590592 => Twitter', function(){
        var h = getRelevantHeuristic('https://twitter.com/MozDevNet/status/649599676308590592');
        
        return assert.strictEqual(h, twitterHeuristic);
    });
    
    it('https://mobile.twitter.com/yo => Twitter', function(){
        var h = getRelevantHeuristic('https://mobile.twitter.com/yo');
        
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
    
    it('http://www.slideshare.net/doaj/ => Slideshare', function(){
        var h = getRelevantHeuristic('http://www.slideshare.net/doaj/');
        
        return assert.strictEqual(h, slideshareHeuristic);
    });
    
    it('http://pt.slideshare.net/about => Slideshare', function(){
        var h = getRelevantHeuristic('http://pt.slideshare.net/about');
        
        return assert.strictEqual(h, slideshareHeuristic);
    });
    
    it('https://www.youtube.com/watch?v=JGhoLcsr8GA => Youtube', function(){
        var h = getRelevantHeuristic('https://www.youtube.com/watch?v=JGhoLcsr8GA');
        
        return assert.strictEqual(h, youtubeHeuristic);
    });
    
    it('http://www.youtube.com/user/ASAveterinaria => Youtube', function(){
        var h = getRelevantHeuristic('http://www.youtube.com/user/ASAveterinaria');
        
        return assert.strictEqual(h, youtubeHeuristic);
    });
    
    it('https://vimeo.com/worrydream => Vimeo', function(){
        var h = getRelevantHeuristic('https://vimeo.com/worrydream');
        
        return assert.strictEqual(h, vimeoHeuristic);
    });
    
    it('http://vimeo.com/115154289 => Vimeo', function(){
        var h = getRelevantHeuristic('http://vimeo.com/115154289');
        
        return assert.strictEqual(h, vimeoHeuristic);
    });
    
});

// https://developers.facebook.com/?ref=pf => 'developers.facebook.com' (default)