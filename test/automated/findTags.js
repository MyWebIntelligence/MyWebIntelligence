"use strict";

require('../../ES-mess');

process.env.NODE_ENV = "test";

var assert = assert = require('chai').assert;
require('chai-as-promised');

var findTags = require('../../client/findTags.js');

describe('findTags', function(){
    
    it('should return {tags: [], leftover: ""} for the empty string', function(){
        var res = findTags('')
        
        assert.strictEqual(res.leftover, '');
        assert.strictEqual(res.tags.size, 0);
    });
    
    it('should return {tags: [], leftover: " "} for " "', function(){
        var res = findTags(' ')
        
        assert.strictEqual(res.leftover, ' ');
        assert.strictEqual(res.tags.size, 0);
    });
    
    it('should return {tags: [], leftover: ""} for ","', function(){
        var res = findTags(',')
        
        assert.strictEqual(res.leftover, '');
        assert.strictEqual(res.tags.size, 0);
    });
    
    it('should return {tags: ["yo"], leftover: ""} for "yo;"', function(){
        var res = findTags('yo;')
        
        assert.strictEqual(res.leftover, '');
        
        assert.strictEqual(res.tags.size, 1);
        assert.ok(res.tags.has('yo'));
    });
    
    it('should return {tags: ["yo"], leftover: ""} for "yo ;"', function(){
        var res = findTags('yo ;')
        
        assert.strictEqual(res.leftover, '');
        
        assert.strictEqual(res.tags.size, 1);
        assert.ok(res.tags.has('yo'));
    });
    
    it('should return {tags: [], leftover: "yo"} for "yo"', function(){
        var res = findTags('yo')
        
        assert.strictEqual(res.leftover, 'yo');
        
        assert.strictEqual(res.tags.size, 0);
    });
    
    it('should return {tags: [], leftover: "yo "} for "yo "', function(){
        var res = findTags('yo ')
        
        assert.strictEqual(res.leftover, 'yo ');
        
        assert.strictEqual(res.tags.size, 0);
    });
    
    it('should return {tags: ["yo"], leftover: ""} for "yo;yo;"', function(){
        var res = findTags("yo;yo;")
        
        assert.strictEqual(res.leftover, '');
        
        assert.strictEqual(res.tags.size, 1);
        assert.ok(res.tags.has('yo'));
    });
    
    it('should return {tags: ["yo", "ya"], leftover: ""} for "yo;ya;"', function(){
        var res = findTags("yo;ya;")
        
        assert.strictEqual(res.leftover, '');
        
        assert.strictEqual(res.tags.size, 2);
        assert.ok(res.tags.has('yo'));
        assert.ok(res.tags.has('ya'));
    });
    
    it('should return {tags: ["yo", "ya"], leftover: "yi"} for "yo;ya; yi"', function(){
        var res = findTags("yo;ya; yi")
        
        assert.strictEqual(res.leftover, 'yi');
        
        assert.strictEqual(res.tags.size, 2);
        assert.ok(res.tags.has('yo'));
        assert.ok(res.tags.has('ya'));
    });
    
    it('should return {tags: ["Social Network Analysis"], leftover: ""} for "Social Network Analysis;"', function(){
        var res = findTags("Social Network Analysis;")
        
        assert.strictEqual(res.leftover, '');
        
        assert.strictEqual(res.tags.size, 1);
        assert.ok(res.tags.has("Social Network Analysis"));
    });
    
    it('should return {tags: ["garçon"], leftover: ""} for "garçon;"', function(){
        var res = findTags("garçon;")
                
        assert.strictEqual(res.leftover, '');
        
        assert.strictEqual(res.tags.size, 1);
        assert.ok(res.tags.has("garçon"));
    });
    
    
});