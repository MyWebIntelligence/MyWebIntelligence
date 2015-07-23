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
                .where(annotations.id.equals(aid))
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
        
        For each (resourceId, territoireId, type) tuple, this function returns the latest annotation (max creation_date)
        regardless of what that date is and of the annotation author.
        This function is meant for exports.
        In the future other functions will enable introspecting annotation history
    */
    findLatestByResourceIdsAndTerritoireId: function(resourceIds, territoireId){
        
        /*
            For each (resourceId, territoireId, type) tuple, find the latest annotation (max creation_date)
        */
        var latestAnnotation = annotations
            .subQuery('latest_annotation')
            .select(
                annotations.resource_id, 
                annotations.type.as('ann_type'), // to prevent collision with latestAnnotation.type (=== "SUBQUERY")
                annotations.created_at.max().as('latest_date')
            )
            .where(annotations.territoire_id.equals(territoireId).and(
                annotations.resource_id.in(resourceIds.toJSON())
            ))
            .group(
                annotations.resource_id,
                annotations.type
            );
        
        //console.log('latestAnnotation', latestAnnotation.table, latestAnnotation);
        
        
        return databaseP.then(function(db){
            var query = annotations
                .select(
                    annotations.resource_id, 
                    annotations.type,
                    annotations.value
                )
                .from( annotations
                       .join(latestAnnotation)
                       .on( annotations.resource_id.equals(latestAnnotation.resource_id).and(
                            annotations.type.equals(latestAnnotation.ann_type).and(
                            annotations.created_at.equals(latestAnnotation.latest_date)
                        ) ) )
                )
                .where( annotations.value.isNotNull() )
                .toQuery();

            //console.log('Annotations findLatestByResourceIdsAndTerritoireId query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    }
};
