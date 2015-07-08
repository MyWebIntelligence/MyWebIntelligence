"use strict";

var sql = require('sql');
sql.setDialect('postgres');

var databaseP = require('./databaseClientP');

var annotations = require('./declarations.js').annotations;

module.exports = {
    // expressionData is an array
    create: function(annotationData){
        return databaseP.then(function(db){
            var query = annotations
                .insert(annotationData)
                .returning('id')
                .toQuery();

            //console.log('Annotations create query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    },
    
    update: function(aid, delta){
        return databaseP.then(function(db){
            var query = annotations
                .update(delta)
                .toQuery();

            //console.log('Annotations update query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    },
    
    findById: function(id){
        return databaseP.then(function(db){
            var query = annotations
                .select('*')
                .where( annotations.id.equals(id) )
                .toQuery();

            //console.log('Annotations findById query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        })
    },
    
    /*
        resourceIds: Set<ResourceId>
    */
    findByResourceIdsAndTerritoireId: function(resourceIds, territoireId){
        return databaseP.then(function(db){
            var query = annotations
                .select('*')
                .where( annotations.territoire_id.equals(territoireId).and(annotations.resource_id.in(resourceIds.toJSON())) )
                .toQuery();

            //console.log('Annotations findById query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    }
};
