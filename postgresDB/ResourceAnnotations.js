"use strict";

var sql = require('sql');
sql.setDialect('postgres');

var databaseP = require('./databaseClientP');

var databaseJustCreatedSymbol = require('./databaseJustCreatedSymbol');
var justCreatedMarker = {};
justCreatedMarker[databaseJustCreatedSymbol] = true;

var resource_annotations = require('./declarations.js').resource_annotations;

module.exports = {

    create: function(annotationData){
        if(!Array.isArray(annotationData))
            annotationData = [annotationData];
        
        return databaseP.then(function(db){
            var query = resource_annotations
                .insert(annotationData)
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
    
    update: function(resourceId, territoireId, userId, values, approved, expressionDomainId){
        
        return databaseP
            .then(function(db){
            
                var query = resource_annotations
                    .select(resource_annotations.approved, resource_annotations.values)
                    .where(resource_annotations.resource_id.equals(resourceId).and(
                        resource_annotations.territoire_id.equals(territoireId)
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
                        if(expressionDomainId !== undefined)
                            update.expression_domain_id = expressionDomainId;
                    
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
                    
                        var query = resource_annotations
                            .update(update)
                            .where(resource_annotations.resource_id.equals(resourceId).and(
                                resource_annotations.territoire_id.equals(territoireId)
                            ))
                            .toQuery();

                        //console.log('ResourceAnnotations update query', query);

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
            var query = resource_annotations
                .select('*')
                .where( resource_annotations.id.equals(id) )
                .toQuery();

            //console.log('ResourceAnnotations findById query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        })
    },
    
    findNotApproved: function(territoireId){
        return databaseP.then(function(db){
            var query = resource_annotations
                .select(
                    resource_annotations.resource_id
                )
                .where(
                    resource_annotations.territoire_id.equals(territoireId).and(
                        resource_annotations.approved.equals(false)
                    )
                )
                .toQuery();

            //console.log('ResourceAnnotations findNotApproved query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    },
    
    /*
        resourceIds: Set<ResourceId>
        
        This function is meant for exports.
    */
    findByTerritoireId: function(territoireId){        
        return databaseP.then(function(db){
            var query = resource_annotations
                .select(
                    resource_annotations.resource_id, 
                    resource_annotations.values, 
                    resource_annotations.expression_domain_id
                )
                .where(
                    resource_annotations.territoire_id.equals(territoireId).and(
                        // should be:
                        //resource_annotations.values.isNotNull().and(
                        //    resource_annotations.approved.equals(true)
                        //)
                        // but for now that we don't crawl, do:
                        resource_annotations.values.isNotNull().and(
                            resource_annotations.approved.equals(true).or(resource_annotations.approved.isNull())
                        )
                    )
                )
                .toQuery();

            //console.log('ResourceAnnotations findByTerritoireId query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    }
};
