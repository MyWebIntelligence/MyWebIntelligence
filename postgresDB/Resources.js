"use strict";

var sql = require('sql');
sql.setDialect('postgres');

var databaseP = require('./databaseClientP');

var resources = sql.define({
    name: 'resources',
    columns: ['id', 'url', 'alias_of', 'expression_id']
});


module.exports = {
    /*
        urls is a Set<url>
    */
    create: function(urls){
        return databaseP.then(function(db){
            var query = resources
                .insert(urls.toJSON().map(function(url){
                    return {
                        url: url
                    };
                }))
                .returning('id')
                .toQuery();

            //console.log('Resources create query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    },
    
    findByURL: function(url){
        return databaseP.then(function(db){
            var query = resources
                .select('*')
                .from(resources)
                .where(resources.url.equals(url))
                .toQuery();

            //console.log('Resources findByURL query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        })
    },
    
    deleteAll: function(){
        return databaseP.then(function(db){
            var query = resources
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
