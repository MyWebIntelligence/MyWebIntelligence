"use strict";

process.env.NODE_ENV = "test";

var Promise = require('es6-promise').Promise;

var assert = assert = require('chai').assert;
require('chai-as-promised');

var db = require('../../database/index.js');

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
]

var territoireData = [
    {
        "name": "Chaipa",
        "description": "Pour un screenshot"
    },
    {
        "name": "yo",
        "description": "bla"
    },
    {
        "name": "Ants",
        "description": "des fourmis"
    }
];

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
            assert.ok('currentUser' in result);
            assert.equal(result.currentUser.name, "David Bruant");
            assert.ok(Array.isArray(result.currentUser.territoires));
            assert.equal(result.currentUser.territoires.length, 0);
            
            assert.ok(Array.isArray(result.oracles));
            assert.equal(result.oracles.length, 2);
            assert.ok(result.oracles[0].name === oracleData[0].name || result.oracles[0].name === oracleData[1].name);
        })
    });
    
    describe('should return the user with 2 territoires with no queries', function(){
        
        before(function(){
            
            return Promise.all(territoireData.map(function(td){
                td["created_by"] = users[0].id;
                return db.Territoires.create(td)
            }))
        })
        
        it('', function(){
            
            return getUserInitData(users[0].id).then(function(result){
                assert.ok('currentUser' in result);
                assert.equal(result.currentUser.name, "David Bruant");

                assert.ok(Array.isArray(result.oracles));
                assert.equal(result.oracles.length, 2);


                assert.ok(Array.isArray(result.currentUser.territoires));
                assert.equal(result.currentUser.territoires.length, 3);
                var firstTerritoireName = result.currentUser.territoires[0].name
                
                assert.ok(
                    firstTerritoireName === territoireData[0].name ||
                    firstTerritoireName === territoireData[1].name ||
                    firstTerritoireName === territoireData[2].name);
                
                assert.ok(Array.isArray(result.currentUser.territoires[0].queries));
                assert.equal(result.currentUser.territoires[0].queries.length, 0);
                assert.ok(Array.isArray(result.currentUser.territoires[1].queries));
                assert.equal(result.currentUser.territoires[1].queries.length, 0);
            });
        
        });
        
        after(deleteAllTerritoires);
        
    });
    
    
    describe('should return the user with 2 territoires with queries in one of the territoire', function(){
        
        before(function(){
            var territoires;
            
            var territoiresP = Promise.all(territoireData.map(function(td){
                td["created_by"] = users[0].id;
                return db.Territoires.create(td)
            })).then(function(_territoires){
                territoires = _territoires;
            });
            
            var queriesP = territoiresP.then(function(){
                return Promise.all(queryData.map(function(qd){
                    qd["belongs_to"] = territoires[0].id;
                    return db.Queries.create(qd)
                }));
            });
            
            return Promise.all([
                territoiresP,
                queriesP
            ]);
            
        });
        
        it('', function(){
            
            return getUserInitData(users[0].id).then(function(result){
                assert.ok('currentUser' in result);
                assert.equal(result.currentUser.name, "David Bruant");

                assert.ok(Array.isArray(result.oracles));
                assert.equal(result.oracles.length, 2);
                
                assert.ok(Array.isArray(result.currentUser.territoires));
                assert.equal(result.currentUser.territoires.length, 3);
                
                assert.ok(Array.isArray(result.currentUser.territoires[0].queries));
                assert.equal(result.currentUser.territoires[0].queries.length, 2);
                assert.ok(Array.isArray(result.currentUser.territoires[1].queries));
                assert.equal(result.currentUser.territoires[1].queries.length, 0);
                
                var firstTerr = result.currentUser.territoires[0]
                assert.ok(
                    firstTerr.queries[0].name === queryData[0].name ||
                    firstTerr.queries[0].name === queryData[1].name);
            });
        
        });
        
        after(function(){
            return deleteAllQueries().then(deleteAllTerritoires)
        });
        
    });
    
    
    after(deleteAllUsers);
});