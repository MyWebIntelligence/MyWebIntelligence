"use strict";

var sql = require('sql');
sql.setDialect('postgres');

var databaseP = require('./databaseClientP');

var links = require('./declarations.js').links;


module.exports = {
    /*
        linksData is a {source: ResourceId, target: ResourceId}[]
    */
    create: function(linksData){
        return databaseP.then(function(db){
            var query = links
                .insert(linksData)
                .toQuery();

            //console.log('Links create query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    },
    
    /* sourceIds is a Set<SourceId> */
    findBySources: function(sourceIds){
        return databaseP.then(function(db){
            var query = links
                .select('*')
                .where(links.source.in(sourceIds.toJSON()))
                .toQuery();

            //console.log('Links create query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    },
    
    deleteAll: function(){
        return databaseP.then(function(db){
            var query = links
                .delete()
                .toQuery();

            //console.log('Resources deleteAll query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result);
                });
            });
        })
    }
    
};
