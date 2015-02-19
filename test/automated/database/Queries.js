"use strict";

require('../../../ES-mess');

process.env.NODE_ENV = "test";

var assert = assert = require('chai').assert;
require('chai-as-promised');

var db = require('../../../database/index.js');

var deleteAllQueries = db.Queries.deleteAll.bind(db.Queries);
var deleteAllOracles = db.Oracles.deleteAll.bind(db.Oracles);

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
var oracles;


describe('Queries', function(){
   
    var t;
    var queryData = [
        {
            "name": "a",
            "q": "a",
            "lang": "none",
            "nbPage": 400,
            "belongs_to": 1
        },
        {
            "name": "Amar Lakel",
            "q": "Amar Lakel",
            "lang": "none",
            "nbPage": 400,
            "belongs_to": 2
        },
        {
            "name": "Alex",
            "q": "Alexandre Vallette",
            "lang": "none",
            "nbPage": 400,
            "belongs_to": 1
        },
        {
            "name": "Orelsan",
            "q": "Orelsan",
            "lang": "none",
            "nbPage": 400,
            "belongs_to": 2
        }
    ];
    
    before(function(){
        return Promise.all(oracleData.map(function(od){
            return db.Oracles.create(od);
        })).then(function(_oracles){
            oracles = _oracles;
            queryData[0].oracle_id = queryData[1].oracle_id = oracles[0].id;
            queryData[2].oracle_id = queryData[3].oracle_id = oracles[1].id;
        });
    });
    
    describe('create', function(){

        it('should create one query', function(){
            return db.Queries.create( queryData[0] )
                .then(function(q){
                    assert.ok(Object(q) === q);
                    assert.equal(typeof q.id, "number");
                
                    return db.Queries.getAll().then(function(all){
                        assert.isTrue(Array.isArray(all));
                        assert.strictEqual(all.length, 1);
                        assert.strictEqual(all[0].name, "a");
                        
                    });
                });
                
        });

        after(deleteAllQueries);

    });
    
    describe('create two', function(){
        it('should create two queries', function(){
            var q1P = db.Queries.create(queryData[0]);
            var q2P = db.Queries.create(queryData[1]);

            return Promise.all([q1P, q2P])
                .then(function(){
                    return db.Queries.getAll().then(function(all){

                        assert.isTrue(Array.isArray(all));
                        assert.strictEqual(all.length, 2);

                        var q1 = all[0];
                        var q2 = all[1];

                        assert.ok(q1.name !== q2.name);
                        assert.ok(q1.name === queryData[0].name || q2.name === queryData[0].name );

                    });
                });
        });

        after(deleteAllQueries);
    });
    
    describe('update', function(){
        it('should update one query', function(){
            var id1, id2;
            var NEW_NAME = "Whaddup";

            return db.Queries.create( queryData[0] )
                .then(function(q){
                    id1 = q.id;

                    return db.Queries.update({
                        id: q.id,
                        name: NEW_NAME
                    });
                })
                .then(function(q){
                    id2 = q.id;
                    return db.Queries.findById(q.id);
                })
                .then(function(q){
                    assert.strictEqual(id1, id2);
                    assert.strictEqual(q.name, NEW_NAME);
                });
        });

        after(deleteAllQueries);
    });
    
    describe('delete', function(){
        it('should delete one query', function(){            
            return db.Queries.create( queryData[0] )
            .then(function(q){
                return db.Queries.delete(q.id);
            })
            .then(function(){
                return db.Queries.getAll();
            })
            .then(function(all){
                assert.strictEqual(all.length, 0);
            });
        });

        after(deleteAllQueries);
    });

    
    describe('findByBelongsTo', function(){
        before(function(){
            return Promise.all(queryData.map(function(td){ return db.Queries.create(td); }));
        });
        
        it('should find queries by findByBelongsTo', function(){            
            return db.Queries.findByBelongsTo( 2 )
                .then(function(qs){
                    assert.ok(Array.isArray(qs));
                    assert.strictEqual(qs.length, 2);
                    assert.notStrictEqual(qs[0].name, qs[1].name);
                });
        });
        
        it('should not find queries by findByBelongsTo', function(){            
            return db.Queries.findByBelongsTo( 37 )
                .then(function(qs){
                    assert.ok(Array.isArray(qs));
                    assert.strictEqual(qs.length, 0);
                });
        });
        
        after(deleteAllQueries);
    });

    after(deleteAllOracles);
    
})