"use strict";

var sql = require('sql');
sql.setDialect('postgres');

var databaseP = require('../management/databaseClientP');

var databaseJustCreatedSymbol = require('./databaseJustCreatedSymbol');
var justCreatedMarker = {};
justCreatedMarker[databaseJustCreatedSymbol] = true;

var users = require('../management/declarations.js').users;

module.exports = {

    getAll: function(){
        return databaseP.then(function(db){
            var query = users
                .select(users.star())
                .toQuery();

            //console.log('Users getAll query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    },
    
    findById: function(userId){
        return databaseP.then(function(db){
            var query = users
                .select(users.star())
                .where(users.id.equals(userId))
                .toQuery();

            //console.log('Users findById query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        })
    },
    
    findByGoogleId: function(googleId){
        return databaseP.then(function(db){
            var query = users
                .select(users.star())
                .where(users.google_id.equals(googleId))
                .toQuery();

            //console.log('Users findByGoogleId query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        })
    },
    
    create: function(userData){
        if(!Array.isArray(userData))
            userData = [userData];
        
        return databaseP.then(function(db){
            var query = users
                .insert(userData)
                .returning(users.star())
                .toQuery();

            //console.log('Users create query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(Object.assign(err, {query: query}));
                    else resolve( result.rows.map(function(r){
                        return Object.assign( r, justCreatedMarker );
                    }) );
                });
            });
        })
    },
    
    update: function(user){ 
        return databaseP.then(function(db){
            var query = users
                .update(user)
                .where(users.id.equals(user.id))
                .toQuery();

            //console.log('Users update query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        })
    },
    
    delete: function(userId){
        return databaseP.then(function(db){
            var query = users
                .delete()
                .where(users.id.equals(userId))
                .toQuery();

            //console.log('Users delete query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        })
    },
    
    deleteAll: function(){
        return databaseP.then(function(db){
            var query = users
                .delete()
                .toQuery();

            //console.log('Users deleteAll query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    }
};
