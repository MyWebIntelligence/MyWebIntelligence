"use strict";

var sql = require('sql');
sql.setDialect('postgres');

var databaseP = require('../management/databaseClientP');

var databaseJustCreatedSymbol = require('./databaseJustCreatedSymbol');
var justCreatedMarker = {};
justCreatedMarker[databaseJustCreatedSymbol] = true;

var oracles = require('../management/declarations.js').oracles;

function prepareForDatabase(o){
    if(o.credentials_infos){
        o.credentials_infos = JSON.stringify(o.credentials_infos);
    }
    if(o.options){
        o.options = JSON.stringify(o.options);
    }
}


module.exports = {
    // return in array
    getAll: function getAll(){
        return databaseP.then(function(db){
            var query = oracles
                .select(oracles.star())
                .toQuery();

            //console.log('Oracles getAll query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    },
    
    findById: function(oracleId){
        return databaseP.then(function(db){
            var query = oracles
                .select(oracles.star())
                .where(oracles.id.equals(oracleId))
                .toQuery();

            //console.log('Oracles findById query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        })
    },
    
    findByOracleNodeModuleName: function findByOracleNodeModuleName(oracleNodeModuleName){
        return databaseP.then(function(db){
            var query = oracles
                .select(oracles.star())
                .where(oracles.oracle_node_module_name.equals(oracleNodeModuleName))
                .toQuery();

            //console.log('Oracles findByOracleNodeModuleName query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        })
    },
    
    create: function create(oracleData){        
       if(!Array.isArray(oracleData))
            oracleData = [oracleData];
        
        oracleData.forEach(prepareForDatabase)
        
        return databaseP.then(function(db){
            var query = oracles
                .insert(oracleData)
                .returning(oracles.star())
                .toQuery();

            // console.log('Oracles create query', query); 
            
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
    
    update: function(oracleDelta){
        prepareForDatabase(oracleDelta)
        
        return databaseP.then(function(db){
            var query = oracles
                .update(oracleDelta)
                .where(oracles.id.equals(oracleDelta.id))
                .toQuery();

            //console.log('Oracles update query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        })
    },
    
    delete: function(oracleId){
        return databaseP.then(function(db){
            var query = oracles
                .delete()
                .where(oracles.id.equals(oracleId))
                .toQuery();

            //console.log('Oracles delete query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        })
    },
    
    deleteAll: function(){
        return databaseP.then(function(db){
            var query = oracles
                .delete()
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
