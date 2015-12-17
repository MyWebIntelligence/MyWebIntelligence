"use strict";

var sql = require('sql');
sql.setDialect('postgres');

var databaseP = require('../management/databaseClientP');

var databaseJustCreatedSymbol = require('./databaseJustCreatedSymbol');
var justCreatedMarker = {};
justCreatedMarker[databaseJustCreatedSymbol] = true;

var territoires = require('../management/declarations.js').territoires;


module.exports = {
    // return in array form
    getAll: function(){
        return databaseP.then(function(db){
            var query = territoires
                .select(territoires.star())
                .toQuery();

            //console.log('Territoires getAll query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    },
    
    findById: function(territoireId){
        return databaseP.then(function(db){
            var query = territoires
                .select(territoires.star())
                .where(territoires.id.equals(territoireId))
                .toQuery();

            //console.log('Territoires findById query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        })
    },
    
    findByUserId: function(userId){
        return databaseP.then(function(db){
            var query = territoires
                .select(territoires.star())
                .where(territoires.user_id.equals(userId))
                .toQuery();

            //console.log('Territoires findByUserId query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    },
    
    create: function(territoireData){
        if(!Array.isArray(territoireData))
            territoireData = [territoireData];
        
        return databaseP.then(function(db){
            var query = territoires
                .insert(territoireData)
                .returning(territoires.star())
                .toQuery();

            //console.log('Territoires create query', query);
            
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
    
    update: function(territoireDelta){ // Territoire can be a delta-Territoire 
        return databaseP.then(function(db){
            var query = territoires
                .update(territoireDelta)
                .where(territoires.id.equals(territoireDelta.id))
                .toQuery();

            //console.log('Territoires update query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        })
    },
    
    delete: function(territoireId){
        return databaseP.then(function(db){
            var query = territoires
                .delete()
                .where(territoires.id.equals(territoireId))
                .toQuery();

            //console.log('Territoires delete query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        })
    },
    
    deleteAll: function(){
        return databaseP.then(function(db){
            var query = territoires
                .delete()
                .toQuery();

            //console.log('Territoires deleteAll query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    }
};
