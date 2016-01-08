"use strict";

var sql = require('sql');
sql.setDialect('postgres');

var databaseP = require('../management/databaseClientP');

var databaseJustCreatedSymbol = require('./databaseJustCreatedSymbol');
var justCreatedMarker = {};
justCreatedMarker[databaseJustCreatedSymbol] = true;

var queries = require('../management/declarations.js').queries;

module.exports = {
    
    getAll: function(){
        return databaseP.then(function(db){
            var query = queries
                .select(queries.star())
                .toQuery();

            //console.log('Queries getAll query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    },
    
    findById: function(queryId){
        return databaseP.then(function(db){
            var query = queries
                .select(queries.star())
                .where(
                    queries.id.equals(queryId)
                )
                .toQuery();

            //console.log('Queries findById query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        })
    },
    
    findByTerritoireId: function(territoireId){
        return databaseP.then(function(db){
            var query = queries
                .select(queries.star())
                .where(
                    queries.territoire_id.equals(territoireId)
                )
                .toQuery();

            //console.log('Queries findByTerritoireId query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    },
    
    create: function(queryData){
        console.log('Queries.create', queryData);
        
        if(!Array.isArray(queryData))
            queryData = [queryData];
        
        return databaseP.then(function(db){
            var query = queries
                .insert(queryData)
                .returning(queries.star())
                .toQuery();

            // console.log('Queries create query', query); 
            
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
    
    update: function(queryDelta){
        return databaseP.then(function(db){
            var query = queries
                .update(queryDelta)
                .where(queries.id.equals(queryDelta.id))
                .toQuery();

            //console.log('Queries update query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        })
    },
    
    delete: function(queryId){
        return databaseP.then(function(db){
            var query = queries
                .delete()
                .where(queries.id.equals(queryId))
                .toQuery();

            //console.log('Queries delete query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        })
    },
    
    deleteAll: function(){
        return databaseP.then(function(db){
            var query = queries
                .delete()
                .toQuery();

            //console.log('Queries deleteAll query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    }
};
