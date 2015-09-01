"use strict";

var sql = require('sql');
sql.setDialect('postgres');

var databaseP = require('./databaseClientP');

var annotations = require('./declarations.js').annotations;

module.exports = {

    create: function(annotationData){
        if(!Array.isArray(annotationData))
            annotationData = [annotationData];
        
        return databaseP.then(function(db){
            var query = annotations
                .insert(annotationData)
                .toQuery();

            //console.log('Annotations create query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    },
    
    update: function(resourceId, territoireId, userId, values, approved){
        
        return databaseP
            .then(function(db){
            
                var query = annotations
                    .select(annotations.approved, annotations.values)
                    .where(annotations.resource_id.equals(resourceId).and(
                        annotations.territoire_id.equals(territoireId)
                    ))
                    .toQuery();


                return new Promise(function(resolve, reject){
                    db.query(query, function(err, result){
                        if(err) reject(err); else resolve(result.rows[0]);
                    });
                });
            })
            .then(function(currentAnnotation){
                // /!\ between this instant and when the UPDATE occurs, someone else may call .update
                // This is a race condition. Of the two .update calls, only the last one will win.
                // For now, it's considered acceptable as update per (resourceId, territoireId) pair should be rare enough
            
                return databaseP
                    .then(function(db){
                        var update = {};
                    
                        // save the last human user who made an update
                        if(userId !== undefined)
                            update.user_id = userId;
                    
                        var newApproved = typeof approved === 'boolean' && currentAnnotation.approved !== approved ?
                            approved : undefined;
                    
                        if(typeof newApproved === 'boolean')
                            update.approved = newApproved;
                    
                        var newValues = JSON.stringify(
                            Object.assign(
                                JSON.parse(currentAnnotation.values || '{}'),
                                values || {}
                            )
                        )
                        
                        update.values = newValues;
                    
                        var query = annotations
                            .update(update)
                            .where(annotations.resource_id.equals(resourceId).and(
                                annotations.territoire_id.equals(territoireId)
                            ))
                            .toQuery();

                        //console.log('Annotations update query', query);

                        return new Promise(function(resolve, reject){
                            db.query(query, function(err, result){
                                if(err) reject(err); else resolve(result.rows);
                            });
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
    
    findNotApproved: function(territoireId){
        return databaseP.then(function(db){
            var query = annotations
                .select(
                    annotations.resource_id
                )
                .where(
                    annotations.territoire_id.equals(territoireId).and(
                        annotations.approved.equals(false)
                    )
                )
                .toQuery();

            //console.log('Annotations findLatestByResourceIdsAndTerritoireId query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    },
    
    /*
        resourceIds: Set<ResourceId>
        
        For each (resourceId, territoireId) pair, this function returns the annotations
        This function is meant for exports.
    */
    findLatestByResourceIdsAndTerritoireId: function(resourceIds, territoireId){
        
        return databaseP.then(function(db){
            var query = annotations
                .select(
                    annotations.resource_id, 
                    annotations.values
                )
                .where(
                    annotations.territoire_id.equals(territoireId).and(
                        annotations.values.isNotNull().and(
                            annotations.approved.equals(true)
                        )
                    )
                )
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
