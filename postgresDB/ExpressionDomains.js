"use strict";

var sql = require('sql');
sql.setDialect('postgres');

var databaseP = require('./databaseClientP');

var databaseJustCreatedSymbol = require('./databaseJustCreatedSymbol');
var justCreatedMarker = {};
justCreatedMarker[databaseJustCreatedSymbol] = true;

var expression_domains = require('./declarations.js').expression_domains;

module.exports = {

    create: function(edData){
        if(!Array.isArray(edData))
            edData = [edData];
        
        return databaseP.then(function(db){
            var query = expression_domains
                .insert(edData)
                .returning('*')
                .toQuery();

            //console.log('ResourceAnnotations create query', query);
            
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
    
    findByString: function(string){
        return databaseP.then(function(db){
            var query = expression_domains
                .select('*')
                .where( expression_domains.string.equals(string) )
                .toQuery();

            //console.log('ResourceAnnotations findById query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        })
    }
    
};
