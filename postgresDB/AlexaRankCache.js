"use strict";

var sql = require('sql');
sql.setDialect('postgres');

var databaseP = require('./databaseClientP');

var alexaRankCache = require('./declarations.js').alexa_rank_cache;

module.exports = {
    /*
        urls is a Set<url>
    */
    create: function(data){        
        return databaseP.then(function(db){
            var query = alexaRankCache
                .insert(data)
                .returning('*')
                .toQuery();

            //console.log('alexaRankCache create query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(Object.assign(err, {query: query})); else resolve(result.rows[0]);
                });
            });
        })
    },
    
    count: function(){
        return databaseP.then(function(db){
            var query = alexaRankCache
                .select(alexaRankCache.count())
                .toQuery();

            //console.log('alexaRankCache create query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(Object.assign(err, {query: query})); else resolve(result.rows[0]);
                });
            });
        })
    },
    
    findByDomain: function(hostname){
        throw 'TODO'+hostname;
    },
    
    deleteAll: function(){
        return databaseP.then(function(db){
            var query = alexaRankCache
                .delete()
                .toQuery();

            //console.log('alexaRankCache deleteAll query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result);
                });
            });
        })
    }
    
};
