"use strict";

require('../../../ES-mess');

process.env.NODE_ENV = "test";

var chai = require('chai');
var assert = chai.assert;
chai.use(require('chai-as-promised'));

var facebookHeuristics = require('../../../expressionDomain/heuristics/facebook');
var defaultHeuristics = require('../../../expressionDomain/heuristics/default');

var getRelevantHeuristic = require('../../../expressionDomain/getRelevantHeuristic');

describe('Facebook expression domain heuristics', function(){
    
    it('http://facebook.com/pages/Sciences-et-Avenir/194705390569710 => Facebook', function(){
        var h = getRelevantHeuristic('http://facebook.com/pages/Sciences-et-Avenir/194705390569710');
        
        return assert.strictEqual(h, facebookHeuristics);
    });
    
    it('http://fr-fr.facebook.com/mymsa => Facebook', function(){
        var h = getRelevantHeuristic('http://fr-fr.facebook.com/mymsa');
        
        return assert.strictEqual(h, facebookHeuristics);
    });
    
    it('https://developers.facebook.com/?ref=pf => Default', function(){
        var h = getRelevantHeuristic('https://developers.facebook.com/?ref=pf');
        
        return assert.strictEqual(h, defaultHeuristics);
    });
    
    it('https://github.com/MyWebIntelligence/MyWebIntelligence => Default', function(){
        var h = getRelevantHeuristic('https://github.com/MyWebIntelligence/MyWebIntelligence');
        
        return assert.strictEqual(h, defaultHeuristics);
    });
    
    it('https://www.youtube.com/watch?v=JGhoLcsr8GA => Default (soon Youtube)', function(){
        var h = getRelevantHeuristic('https://www.youtube.com/watch?v=JGhoLcsr8GA');
        
        return assert.strictEqual(h, defaultHeuristics);
    });
    
    it('https://twitter.com/MozDevNet/status/649599676308590592 => Default (soon Twitter)', function(){
        var h = getRelevantHeuristic('https://twitter.com/MozDevNet/status/649599676308590592');
        
        return assert.strictEqual(h, defaultHeuristics);
    });
    
});

// https://developers.facebook.com/?ref=pf => 'developers.facebook.com' (default)