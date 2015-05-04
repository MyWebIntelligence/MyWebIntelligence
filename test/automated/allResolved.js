"use strict";

require('../../ES-mess');

process.env.NODE_ENV = "test";

var assert = assert = require('chai').assert;
require('chai-as-promised');

var allResolved = require('../../common/allResolved.js');

describe('allResolved', function(){
    
    it('should return throw if the argument is not an array', function(){
        return Promise.all([
            assert.throws(function(){
                return allResolved();
            }),
            assert.throws(function(){
                return allResolved(1);
            }),
            assert.throws(function(){
                return allResolved('');
            }),
            assert.throws(function(){
                return allResolved(undefined);
            }),
            assert.throws(function(){
                return allResolved(null);
            }),
            assert.throws(function(){
                return allResolved(function(){});
            }),
            assert.throws(function(){
                return allResolved({});
            })
        ]);
        
        
        
        
        /*return getUserInitData(users[0].id).then(function(result){
            assert.ok('user' in result);
            assert.equal(result.user.name, "David Bruant");
            assert.ok(Array.isArray(result.user.territoires));
            assert.equal(result.user.territoires.length, 0);
            
            assert.ok(Array.isArray(result.oracles));
            assert.equal(result.oracles.length, 2);
            assert.ok(result.oracles[0].name === oracleData[0].name || result.oracles[0].name === oracleData[1].name);
        })*/
    });
    
    it('should return a resolving promise for empty array when argument is empty array', function(){
        return allResolved([]).then(function(res){
            assert.isArray(res);
            assert.strictEqual(res.length, 0);
        })
        
    });
    
    it('should return Promise<[37]> for [37]', function(){
        return allResolved([37]).then(function(res){
            assert.isArray(res);
            assert.strictEqual(res.length, 1);
            assert.strictEqual(res[0], 37);
        });
    });
    
    it('should return Promise<[37]> for [Promise.resolve(37)]', function(){
        return allResolved([ Promise.resolve(37) ]).then(function(res){
            assert.isArray(res);
            assert.strictEqual(res.length, 1);
            assert.strictEqual(res[0], 37);
        });
    });
    
    it('should return Promise<[undefined]> for [Promise.reject(37)]', function(){
        return allResolved([ Promise.reject(37) ]).then(function(res){
            assert.isArray(res);
            assert.strictEqual(res.length, 1);
            assert.strictEqual(res[0], undefined);
        });
    });
    
    it('should return Promise<[1, 2]> for [Promise.resolve(1), Promise.resolve(2)]', function(){
        return allResolved([Promise.resolve(1), Promise.resolve(2)]).then(function(res){
            assert.isArray(res);
            assert.strictEqual(res.length, 2);
            assert.strictEqual(res[0], 1);
            assert.strictEqual(res[1], 2);
        });
    });
    
    it('should return Promise<[undefined, 21]> for [Promise.reject(new Error()), Promise.resolve(21)]', function(){
        return allResolved([Promise.reject(new Error()), Promise.resolve(21)]).then(function(res){
            assert.isArray(res);
            assert.strictEqual(res.length, 2);
            assert.strictEqual(res[0], undefined);
            assert.strictEqual(res[1], 21);
        });
    });
    
    
    
    
});