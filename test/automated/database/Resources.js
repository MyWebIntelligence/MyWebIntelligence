"use strict";

require('../../../ES-mess');

process.env.NODE_ENV = "test";

var assert = assert = require('chai').assert;
require('chai-as-promised');

var db = require('../../../database/index.js');
var dropAllTables = require('../../../postgresDB/dropAllTables');
var createTables = require('../../../postgresDB/createTables');

var deleteAllResources = db.Resources.deleteAll.bind(db.Resources);

var url = 'https://www.npmjs.com/package/sql';

describe('Resources', function(){
    
    before(function(){
        return dropAllTables().then(createTables);
    });
    
    
    describe('create', function(){

        it('should create one resources', function(){
            return db.Resources.create( new Set([url]) )
                .then(function(resourceIds){
                    assert.isArray(resourceIds);
                    assert.equal(resourceIds.length, 1);
                    assert.equal(typeof resourceIds[0].id, "number");
                
                    return db.Resources.findValidByURLs( new Set([url]) ).then(function(resources){
                        assert.isArray(resources);
                        assert.equal(resources.length, 1);
                        assert.strictEqual(resources[0].id, resourceIds[0].id);
                        assert.strictEqual(resources[0].url, url);
                    });
                });
                
        });

        after(deleteAllResources);
    });
    
    describe('create 2', function(){

        it('should create two resources', function(){
            var urls = [
                'http://a.web/1',
                'http://a.web/2'
            ];
            
            return db.Resources.create( new Set(urls) )
                .then(function(resourceIds){
                    assert.isArray(resourceIds);
                    assert.equal(resourceIds.length, 2);
                    assert.notStrictEqual(resourceIds[0].id, resourceIds[1].id)
                
                    return db.Resources.findValidByURLs( new Set(urls) ).then(function(resources){
                        assert.isArray(resources);
                        assert.equal(resources.length, 2);
                        assert.ok(resources.some(function(r){
                            return r.url === urls[0]
                        }));
                        assert.ok(resources.some(function(r){
                            return r.id === resourceIds[0].id;
                        }));
                    });
                });
                
        });

        after(deleteAllResources);
    });
    
    describe('addAlias', function(){
        // let's say there is a redirect from [0] to [1]
        var urls = [
            'http://a.web/1',
            'http://a.web/2'
        ];
        var url0resourceId;
        
        before(function(){
            return db.Resources.create( new Set([urls[0]]) ).then(function(r){
                url0resourceId = r[0].id;
            });
        })
        
        it('should create an alias', function(){
            
            return db.Resources.addAlias( url0resourceId, urls[1] )
                .then(function(){                
                    return db.Resources.findValidByURLs( new Set([urls[1]]) )
                        .then(function(rs){
                            var r = rs[0];
                            assert.equal(typeof r.id, "number");
                            assert.notStrictEqual(r.id, url0resourceId);
                            assert.strictEqual(r.url, urls[1]);
                            assert.strictEqual(r.alias_of, null);
                            assert.strictEqual(r.expression_id, null);
                            return r;
                        })
                        .then(function(r1){
                            return db.Resources.findValidByIds( new Set([url0resourceId]) ).then(function(resources){
                                assert.isArray(resources)
                                assert.strictEqual(resources.length, 1)
                                var r0 = resources[0];
                                
                                assert.strictEqual(r0.url, urls[0]);
                                assert.strictEqual(r0.alias_of, r1.id);
                                assert.strictEqual(r0.expression_id, null);
                            })
                        });
                });
                
        });

        after(deleteAllResources);
    });
    
    describe('associateWithExpression', function(){
        // let's say there is a redirect from [0] to [1]
        var urls = [
            'http://a.web/1'
        ];
        var expressionData = {
            title: 'yo',
        };
        
        var resourceId;
        var expressionId;
        
        before(function(){
            return Promise.all([
                db.Resources.create( new Set(urls) ).then(function(r){
                    resourceId = r[0].id;
                    return db.Resources.updateHttpStatus(resourceId, 200);
                }),
                db.Expressions.create([expressionData]).then(function(e){
                    expressionId = e[0].id;
                })
            ]);
        })
        
        it('should create an alias', function(){
            
            return db.Resources.associateWithExpression( resourceId, expressionId )
                .then(function(){                
                    return db.Resources.findValidByURLs( new Set(urls) )
                        .then(function(rs){
                            var r = rs[0];
                            assert.strictEqual(r.url, urls[0]);
                            assert.strictEqual(r.alias_of, null);
                            assert.strictEqual(r.expression_id, expressionId);
                            return r;
                        });
                });
                
        });

        after(deleteAllResources);
    });
})