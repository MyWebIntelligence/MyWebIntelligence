"use strict";

var sql = require('sql');
sql.setDialect('postgres');

var databaseP = require('../management/databaseClientP');

var databaseJustCreatedSymbol = require('./databaseJustCreatedSymbol');
var justCreatedMarker = {};
justCreatedMarker[databaseJustCreatedSymbol] = true;

var query_results = require('../management/declarations.js').query_results;

module.exports = {

    getAll: function(){
       return databaseP.then(function(db){
            var query = query_results
                .select(query_results.star())
                .toQuery();

            //console.log('QuerieResults getAll query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    },
    
    findById: function(queryResultId){
        return databaseP.then(function(db){
            var query = query_results
                .select(query_results.star())
                .where(
                    query_results.id.equals(queryResultId)
                )
                .toQuery();

            //console.log('QuerieResults findById query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        })
    },
    
    findLatestByQueryId: function(queryId){
        return databaseP.then(function(db){
            var query = query_results
                .select(query_results.star())
                .where(
                    query_results.query_id.equals(queryId)
                )
                .order(query_results.created_at.desc)
                .limit(1)
                .toQuery();

            //console.log('QuerieResults findLatestByQueryId query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        })
    },
    
    create: function(queryResultData){
        if(!Array.isArray(queryResultData))
            queryResultData = [queryResultData];
        
        return databaseP.then(function(db){
            var query = query_results
                .insert(queryResultData)
                .returning(query_results.star())
                .toQuery();

            // console.log('QuerieResults create query', query); 
            
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
    
    update: function(queryResult){
        return databaseP.then(function(db){
            var query = query_results
                .update(queryResult)
                .where(query_results.id.equals(queryResult.id))
                .toQuery();

            //console.log('QuerieResults update query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        })
    },
    
    delete: function(queryResultId){
        return databaseP.then(function(db){
            var query = query_results
                .delete()
                .where(query_results.id.equals(queryResultId))
                .toQuery();

            //console.log('QuerieResults delete query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        })
    },
    
    deleteAll: function(){
        return databaseP.then(function(db){
            var query = query_results
                .delete()
                .toQuery();

            //console.log('QuerieResults delete query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    }
};
