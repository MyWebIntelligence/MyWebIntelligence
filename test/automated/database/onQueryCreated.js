"use strict";

require('../../../ES-mess');

process.env.NODE_ENV = "test";

var assert = assert = require('chai').assert;
require('chai-as-promised');

var fs = require('fs');
var path = require('path');

var db = require('../../../database');
var dropAllTables = require('../../../postgresDB/dropAllTables');
var createTables = require('../../../postgresDB/createTables');

var onQueryCreated = require('../../../server/onQueryCreated');

function deleteAll(){
    return Promise.all([
        db.QueryResults.deleteAll(),
        db.Queries.deleteAll(),
        dropAllTables().then(createTables)
    ]);
    
}

var URLs = Object.freeze([
    'http://a.web/1',
    'http://a.web/2',
    'http://a.web/3'
]);

/*
     make a test with a single onQueryCreated call
     make a test with 2 onQueryCreated calls
*/

describe('onQueryCreated', function(){
        
    var oracleId;
    var user;
    
    beforeEach(function(){
        return deleteAll()
            .then(function(){
                return db.Oracles.findByOracleNodeModuleName('URLList')
                    .then(function(oracle){
                        oracleId = oracle.id;
                    });
            })
            .then(function(){
                return db.Users.create({
                    name: 'David'
                }).then(function(u){
                    user = u;
                });
            });
    });
    

    it('should create resources after the onQueryCreated call', function(){
        return db.Queries.create({
            "name": "Bla",
            "q": "Bla",
            "oracle_id": oracleId,
            "belongs_to": 123456,
            "oracleOptions": JSON.stringify({
                list: URLs
            })
        })
            .then(function(query){
                return onQueryCreated(query, user);
            })
            .then(function(){
                return Promise.all([
                    db.Resources.findByURLs(new Set(URLs))
                        .then(function(resources){
                            assert.isArray(resources);
                            assert.strictEqual(resources.length, URLs.length, 'should create resources');
                        }),
                    db.Tasks.getAll()
                        .then(function(tasks){
                            assert.isArray(tasks);
                            assert.strictEqual(tasks.length, URLs.length, 'should create Tasks');
                            tasks.forEach(function(t){
                                assert(t.type, 'prepare_resource');
                            });
                            tasks.forEach(function(t){
                                assert(t.status, 'todo');
                            });
                        })
                ]);
            });

    });

    it('should create 3 resources after 2 onQueryCreated calls where there is an overlap in query results (0, 1) & (0, 2)', function(){
        return Promise.all([
            db.Queries.create({
                "name": "Bla",
                "q": "Bla",
                "oracle_id": oracleId,
                "belongs_to": 123456,
                "oracleOptions": JSON.stringify({
                    list: [URLs[0], URLs[1]]
                })
            })
            .then(function(query){
                return onQueryCreated(query, user);
            }),
            db.Queries.create({
                "name": "Bli",
                "q": "Blou",
                "oracle_id": oracleId,
                "belongs_to": 123456,
                "oracleOptions": JSON.stringify({
                    list: [URLs[0], URLs[2]]
                })
            })
            .then(function(query){
                return onQueryCreated(query, user);
            })
        ])  
            .then(function(){
                return Promise.all([
                    db.Resources.findByURLs(new Set(URLs))
                        .then(function(resources){
                            assert.isArray(resources);
                            assert.strictEqual(resources.length, 3);
                        }),
                    db.Tasks.getAll()
                        .then(function(tasks){
                            assert.isArray(tasks);
                            // may create an superfluous task 
                            assert.ok(tasks.length >= 3);
                            tasks.forEach(function(t){
                                assert(t.status, 'todo');
                            });
                        })
                ]);
            });

    });

        
    afterEach(deleteAll)
    
});
