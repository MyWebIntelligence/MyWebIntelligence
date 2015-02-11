"use strict";

process.env.NODE_ENV = "test";

var Promise = require('es6-promise').Promise;

var assert = assert = require('chai').assert;
require('chai-as-promised');

var db = require('../../database/index.js');



var deleteAllOracles = db.Oracles.deleteAll.bind(db.Oracles);

describe('Oracles', function(){

    var u;
    var oracleData = [
        {
            "name": "Google Custom Search Engine",
            "oracleNodeModuleName": "GCSE",
            "needsCredentials": {
                "API key": "text",
                "cx": "text"
            }
        },
        {
            "name": "URL list",
            "oracleNodeModuleName": "URLList",
            "needsCredentials": false
        }
    ];
    
    
    describe('create', function(){

        it('should create one oracle', function(){
            return db.Oracles.create( oracleData[0] )
                .then(function(o){
                    assert.ok(Object(o) === o);
                    assert.equal(typeof o.id, "number");
                
                    return db.Oracles.getAll().then(function(all){
                        assert.isTrue(Array.isArray(all));
                        assert.strictEqual(all.length, 1);
                        assert.strictEqual(all[0].name, "Google Custom Search Engine");
                        
                    });
                });
                
        });

        after(deleteAllOracles);

    });

    describe('create two', function(){
        it('should create two oracles', function(){
            var o1P = db.Oracles.create(oracleData[0]);
            var o2P = db.Oracles.create(oracleData[1]);

            return Promise.all([o1P, o2P])
                .then(function(){
                    return db.Oracles.getAll().then(function(all){
                        assert.isTrue(Array.isArray(all));
                        assert.strictEqual(all.length, 2);

                        var o1 = all[0];
                        var o2 = all[1];

                        assert.ok(o1.name !== o2.name);
                        assert.ok(o1.name === oracleData[0].name || o2.name === oracleData[0].name );
                    });
                });
        });

        after(deleteAllOracles);
    });

    describe('update', function(){
        it('should update one territoire', function(){
            var id1, id2;
            var NEW_NAME = "Whaddup";

            return db.Oracles.create( oracleData[0] )
                .then(function(o){
                    id1 = o.id;

                    return db.Oracles.update({
                        id: o.id,
                        name: NEW_NAME
                    });
                })
                .then(function(o){
                    id2 = o.id;
                    return db.Oracles.findById(o.id);
                })
                .then(function(o){
                    assert.strictEqual(id1, id2);
                    assert.strictEqual(o.name, NEW_NAME);
                });
        });

        after(deleteAllOracles);
    });

    describe('delete', function(){
        it('should delete one territoire', function(){            
            return db.Oracles.create( oracleData[0] )
            .then(function(o){
                return db.Oracles.delete(o.id);
            })
            .then(function(){
                return db.Oracles.getAll();
            })
            .then(function(all){
                assert.strictEqual(all.length, 0);
            });
        });

        after(deleteAllOracles);
    });

    describe('findByOracleNodeModuleName', function(){
        before(function(){
            return Promise.all(oracleData.map(function(od){ return db.Oracles.create(od); }));
        });
        
        it('should find oracles by findByOracleNodeModuleName', function(){            
            return db.Oracles.findByOracleNodeModuleName( "GCSE" )
                .then(function(o){
                    assert.ok(Object(o) === o);
                    assert.strictEqual(o.oracleNodeModuleName, "GCSE");
                });
        });
        
        it('should not find users by findByCreatedBy', function(){            
            return db.Oracles.findByOracleNodeModuleName( "_whatever_" )
                .then(function(o){
                    assert.strictEqual(o, undefined);
                });
        });
        
        after(deleteAllOracles);
    });

})