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

var deleteAllUsers = db.Users.deleteAll.bind(db.Users);

describe('Users', function(){
    
    describe('create', function(){
        
        it('should create one user', function(){
            return db.Users.create( userData[0] )
                .then(function(u){
                    assert.ok(Object(u) === u);
                    assert.equal(typeof u.id, "string");
                
                    return db.Users.getAll().then(function(all){
                        assert.isTrue(Array.isArray(all));
                        assert.strictEqual(all.length, 1);
                        assert.strictEqual(all[0].name, "David Bruant");
                    });
                });
        });
        
        after(deleteAllUsers);
        
    });
    
    describe('create two', function(){
        it('should create two users', function(){
            var u1P = db.Users.create(userData[0]);
            var u2P = db.Users.create(userData[1]);
            
            return Promise.all([u1P, u2P])
                .then(function(){
                    return db.Users.getAll().then(function(all){
                        
                        assert.isTrue(Array.isArray(all));
                        assert.strictEqual(all.length, 2);
                        
                        var u1 = all[0];
                        var u2 = all[1];
                        
                        assert.ok(u1.name !== u2.name);
                        assert.ok(u1.name === userData[0].name || u2.name === userData[0].name );
                        
                    });
                });
        });
        
        after(deleteAllUsers);
    });
    
    describe('update', function(){
        it('should update one user', function(){
            var id1, id2;
            var NEW_NAME = "Amar";
            
            return db.Users.create( userData[0] )
                .then(function(u){
                    id1 = u.id;
                
                    return db.Users.update({
                        id: u.id,
                        name: NEW_NAME
                    });
                })
                .then(function(u){
                    id2 = u.id;
                    return db.Users.findById(u.id);
                })
                .then(function(u){
                    assert.strictEqual(id1, id2);
                    assert.strictEqual(u.name, NEW_NAME);
                });
        });
        
        after(deleteAllUsers);
    });
    
    describe('delete', function(){
        it('should delete one user', function(){            
            return db.Users.create( userData[0] )
                .then(function(u){
                    return db.Users.delete(u.id);
                })
                .then(function(u){
                    return db.Users.getAll();
                })
                .then(function(all){
                    assert.strictEqual(all.length, 0);
                });
        });
        
        after(deleteAllUsers);
    });
    
    
    describe('findByGoogleId', function(){
        before(function(){
            return Promise.all(userData.map(function(ud){ return db.Users.create(ud); }));
        });
        
        it('should find users by findByGoogleId', function(){            
            return db.Users.findByGoogleId( GOOGLE_ID )
                .then(function(u){
                    assert.ok(Object(u) === u);
                    assert.strictEqual(u.name, "David Bruant");
                });
        });
        
        it('should not find users by findByGoogleId', function(){            
            return db.Users.findByGoogleId( "_whatever_" )
                .then(function(u){
                    assert.equal(typeof u, "undefined");
                });
        });
        
        after(deleteAllUsers);
    });
    
})