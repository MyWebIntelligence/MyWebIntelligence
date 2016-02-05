"use strict";

var sql = require('sql');
sql.setDialect('postgres');

var databaseP = require('../management/databaseClientP');

var databaseJustCreatedSymbol = require('./databaseJustCreatedSymbol');
var justCreatedMarker = {};
justCreatedMarker[databaseJustCreatedSymbol] = true;

var oracle_credentials = require('../management/declarations.js').oracle_credentials;

module.exports = {
    // return in array
    getAll: function(){
        return databaseP.then(function(db){
            var query = oracle_credentials
                .select(oracle_credentials.star())
                .toQuery();

            //console.log('OracleCredentials getAll query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    },
    
    findByUserAndOracleId: function(userId, oracleId){
        return databaseP.then(function(db){
            var query = oracle_credentials
                .select(oracle_credentials.star())
                .where(
                    oracle_credentials.user_id.equals(userId),
                    oracle_credentials.oracle_id.equals(oracleId)
                )
                .toQuery();

            //console.log('OracleCredentials findByUserAndOracleId query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    },
    
    findByUserId: function(userId){
        return databaseP.then(function(db){
            var query = oracle_credentials
                .select(oracle_credentials.star())
                .where(
                    oracle_credentials.user_id.equals(userId)
                )
                .toQuery();

            //console.log('OracleCredentials findByUserAndOracleId query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    },
    
    create: function(oracleCredentialsData){
        if(!Array.isArray(oracleCredentialsData))
            oracleCredentialsData = [oracleCredentialsData];

        return databaseP.then(function(db){
            var query = oracle_credentials
                .insert(oracleCredentialsData)
                .returning(oracle_credentials.star())
                .toQuery();

            // console.log('OracleCredentials create query', query); 
            
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
    
    update: function(oracleCredentialsData){            
        return databaseP.then(function(db){
            var query = oracle_credentials
                .update(oracleCredentialsData)
                .where(
                    oracle_credentials.user_id.equals(oracleCredentialsData.user_id),
                    oracle_credentials.oracle_id.equals(oracleCredentialsData.oracle_id)
                )
                .toQuery();

            //console.log('oracleCredentialsData update query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        })
    },
    
    createOrUpdate: function(oracleCredentialsData){
        var self = this;        
        return databaseP.then(function(db){
            var query = oracle_credentials
                .select(oracle_credentials.star())
                .where(
                    oracle_credentials.user_id.equals(oracleCredentialsData.user_id),
                    oracle_credentials.oracle_id.equals(oracleCredentialsData.oracle_id)
                )
                .toQuery();

            // console.log('OracleCredentials createOrUpdate query', query); 
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(Object.assign(err, {query: query}));
                    else resolve( result.rows[0] ?
                        self.update(oracleCredentialsData) :
                        self.create(oracleCredentialsData)
                    );
                });
            });
        })
    },
    
    delete: function(oracleCredentialsId){
        return databaseP.then(function(db){
            var query = oracle_credentials
                .delete()
                .where(oracle_credentials.id.equals(oracleCredentialsId))
                .toQuery();

            //console.log('Oracles deleteAll query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        })
    }
};
