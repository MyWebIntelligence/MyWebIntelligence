"use strict";

require('../../../ES-mess');

process.env.NODE_ENV = "test";

var assert = assert = require('chai').assert;
require('chai-as-promised');

var db = require('../../../database/index.js');

var GOOGLE_ID = String(Math.round(Math.random() * Math.pow(2, 30)));

var userData = [
    {
        name: "David Bruant",
        "google_id": GOOGLE_ID
    },
    {
        name: "Amar Lakel"
    }
];

var oracleData = [
    {
        "name": "Google Custom Search Engine",
        "oracle_node_module_name": "GCSE",
        "credentials_infos": {
            "API key": "text",
            "cx": "text"
        }
    },
    {
        "name": "URL list",
        "oracle_node_module_name": "URLList",
        "credentials_infos": null
    }
]

var territoireData = [
    {
        "name": "Chaipa",
        "description": "Pour un screenshot"
    },
    {
        "name": "yo",
        "description": "bla"
    }
];

var queryData = [
    {
        "name": "a",
        "q": "a",
        "lang": "none",
        "nbPage": 400
    },
    {
        "name": "Amar Lakel",
        "q": "Amar Lakel",
        "lang": "none",
        "nbPage": 400
    }
];

var getUserInitData = db.complexQueries.getUserInitData;

var deleteAllUsers = db.Users.deleteAll.bind(db.Users);
var deleteAllQueries = db.Queries.deleteAll.bind(db.Queries);
var deleteAllOracles = db.Oracles.deleteAll.bind(db.Oracles);
var deleteAllTerritoires = db.Territoires.deleteAll.bind(db.Territoires);


describe('Complex queries: getUserInitData', function(){
    
    var users;
    var oracles;
    
    before(function(){
        var usersP = Promise.all(userData.map(function(ud){
            return db.Users.create(ud)
        })).then(function(_users){ users = _users; });
        
        var oraclesP = Promise.all(oracleData.map(function(od){
            return db.Oracles.create(od)
        })).then(function(_oracles){ oracles = _oracles; });
        
        return Promise.all([
            usersP,
            oraclesP
        ]);
    });
    
    it('should return the user description (with territoires: []) and oracles', function(){
        return getUserInitData(users[0].id).then(function(result){
            assert.ok('user' in result);
            assert.equal(result.user.name, "David Bruant");
            assert.ok(Array.isArray(result.user.territoires));
            assert.equal(result.user.territoires.length, 0);
            
            assert.ok(Array.isArray(result.oracles));
            assert.equal(result.oracles.length, 2);
            assert.ok(result.oracles[0].name === oracleData[0].name || result.oracles[0].name === oracleData[1].name);
        })
    });
    
    describe('should return the user with 2 territoires with no queries', function(){
        
        before(function(){
            
            return Promise.all(territoireData.map(function(td){
                td["user_id"] = users[0].id;
                return db.Territoires.create(td)
            }))
        })
        
        it('', function(){
            
            return getUserInitData(users[0].id).then(function(result){
                assert.ok('user' in result);
                assert.equal(result.user.name, "David Bruant");

                assert.ok(Array.isArray(result.oracles));
                assert.equal(result.oracles.length, 2);


                assert.ok(Array.isArray(result.user.territoires));
                assert.equal(result.user.territoires.length, 2);
                var firstTerritoireName = result.user.territoires[0].name
                
                assert.ok(
                    firstTerritoireName === territoireData[0].name ||
                    firstTerritoireName === territoireData[1].name ||
                    firstTerritoireName === territoireData[2].name);
                
                assert.ok(Array.isArray(result.user.territoires[0].queries));
                assert.equal(result.user.territoires[0].queries.length, 0);
                assert.ok(Array.isArray(result.user.territoires[1].queries));
                assert.equal(result.user.territoires[1].queries.length, 0);
            });
        
        });
        
        after(deleteAllTerritoires);
        
    });
    
    
    describe('should return the user with 2 territoires with queries in one of the territoire', function(){
        
        before(function(){
            var territoires;
            
            var territoiresP = Promise.all(territoireData.map(function(td){
                td["user_id"] = users[0].id;
                return db.Territoires.create(td);
            })).then(function(_territoires){
                territoires = _territoires;
            });
            
            var queriesP = territoiresP.then(function(){
                return Promise.all(queryData.map(function(qd){
                    qd["belongs_to"] = territoires[0].id;
                    return db.Queries.create(qd);
                }));
            });
            
            return Promise.all([
                territoiresP,
                queriesP
            ]);
            
        });
        
        it('', function(){
            
            return getUserInitData(users[0].id).then(function(result){
                assert.ok('user' in result);
                assert.equal(result.user.name, "David Bruant");

                assert.ok(Array.isArray(result.oracles));
                assert.equal(result.oracles.length, 2);
                
                assert.ok(Array.isArray(result.user.territoires));
                assert.equal(result.user.territoires.length, 2);
                
                var t1 = result.user.territoires[0];
                var t2 = result.user.territoires[1];
                
                assert.ok(Array.isArray(t1.queries));
                assert.ok(Array.isArray(t2.queries));
                
                assert.ok(t1.queries.length === 2 || t2.queries.length === 2, "one of the terrioire has 2 queries");
                assert.ok(t1.queries.length === 0 || t2.queries.length === 0, "one of the terrioire has 0 queries");
                
                var territoireWithQueries = result.user.territoires.find(function(t){
                    return t.queries.length === 2;
                })
                
                assert.ok(
                    territoireWithQueries.queries[0].name === queryData[0].name ||
                    territoireWithQueries.queries[0].name === queryData[1].name
                );
            });
        
        });
        
        after(function(){
            return deleteAllQueries().then(deleteAllTerritoires)
        });
        
    });
    
    
    after(deleteAllUsers);
});