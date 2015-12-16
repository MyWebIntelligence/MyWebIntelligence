"use strict";

require('../../../ES-mess');

process.env.NODE_ENV = "test";

var assert = assert = require('chai').assert;
require('chai-as-promised');

var db = require('../../../database/index.js');



var deleteAllTerritoires = db.Territoires.deleteAll.bind(db.Territoires);
var deleteAllUsers = db.Users.deleteAll.bind(db.Users);

describe('Territoires', function(){

    var u;
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
        },
        {
            "name": "Amar Lakel",
            "description": "amar"
        },
        {
            "name": "test",
            "description": "test"
        }
    ];
    
    /*
        Add user_id fields to the 2 first territoire
        None for the rest for now.
    */
    before(function(){
        return db.Users.create({
            name: 'Yo Ta'
        }).then(function(_u){
            u = _u;
            
            territoireData[0].user_id = u.id;
            territoireData[1].user_id = u.id;
        });
    });
    
    describe('create', function(){

        it('should create one territoire', function(){
            return db.Territoires.create( territoireData[0] )
                .then(function(t){
                    return db.Users.findById(t.user_id)
                        .then(function(u){
                            assert.ok(Object(u) === u, "The user_id field of the created object corresponds to an actual userId");
                        })
                        .then(function(){
                            return t;
                        });
                })
                .then(function(t){
                    assert.ok(Object(t) === t);
                    assert.equal(typeof t.id, "number");
                
                    return db.Territoires.getAll().then(function(all){
                        assert.isTrue(Array.isArray(all));
                        assert.strictEqual(all.length, 1);
                        assert.strictEqual(all[0].name, "Chaipa");
                        
                    });
                });
                
        });

        after(deleteAllTerritoires);

    });

    describe('create two', function(){
        it('should create two territoires', function(){
            var t1P = db.Territoires.create(territoireData[0]);
            var t2P = db.Territoires.create(territoireData[1]);

            return Promise.all([t1P, t2P])
                .then(function(){
                    return db.Territoires.getAll().then(function(all){

                        assert.isTrue(Array.isArray(all));
                        assert.strictEqual(all.length, 2);

                        var t1 = all[0];
                        var t2 = all[1];

                        assert.ok(t1.name !== t2.name);
                        assert.ok(t1.name === territoireData[0].name || t2.name === territoireData[0].name );

                    });
                });
        });

        after(deleteAllTerritoires);
    });

    describe('update', function(){
        it('should update one territoire', function(){
            var id1, id2;
            var NEW_NAME = "Whaddup";

            return db.Territoires.create( territoireData[0] )
                .then(function(t){
                    id1 = t.id;

                    return db.Territoires.update({
                        id: t.id,
                        name: NEW_NAME
                    });
                })
                .then(function(t){
                    id2 = t.id;
                    return db.Territoires.findById(t.id);
                })
                .then(function(t){
                    assert.strictEqual(id1, id2);
                    assert.strictEqual(t.name, NEW_NAME);
                });
        });

        after(deleteAllTerritoires);
    });

    describe('delete', function(){
        it('should delete one territoire', function(){            
            return db.Territoires.create( territoireData[0] )
            .then(function(t){
                return db.Territoires.delete(t.id);
            })
            .then(function(u){
                return db.Territoires.getAll();
            })
            .then(function(all){
                assert.strictEqual(all.length, 0);
            });
        });

        after(deleteAllTerritoires);
    });

    
    describe('findByUserId', function(){
        before(function(){
            return Promise.all(territoireData.map(function(td){ return db.Territoires.create(td); }));
        });
        
        it('should find users by findByUserId', function(){            
            return db.Territoires.findByUserId( u.id )
                .then(function(ts){
                    assert.ok(Array.isArray(ts));
                    assert.strictEqual(ts.length, 2);
                    assert.notStrictEqual(ts[0].name, ts[1].name);
                });
        });
        
        it('should not find users by findByUserId', function(){            
            return db.Territoires.findByUserId( "_whatever_" )
                .then(function(ts){
                    assert.ok(Array.isArray(ts));
                    assert.strictEqual(ts.length, 0);
                });
        });
        
        after(deleteAllTerritoires);
    });

    after(deleteAllUsers);
})