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
    
    update: function(resourceId, territoireId, userId, delta){
        if(arguments.length !== 4)
            throw new Error('WOW! '+arguments.length+' arguments in RessourceAnnotations.update call');
        
        return databaseP
            .then(function(db){
                
                delta = Object.assign(
                    {},
                    delta,
                    // just making user a smart user won't override these in the delta
                    {
                        resource_id: resourceId,
                        territoire_id: territoireId,
                        user_id: userId
                    }
                );

                var query = resource_annotations
                    .update(delta)
                    .where(
                        resource_annotations.resource_id.equals(resourceId),
                        resource_annotations.territoire_id.equals(territoireId)
                    )
                    .toQuery();

                //console.log('ResourceAnnotations update query', query);

                return new Promise(function(resolve, reject){
                    db.query(query, function(err, result){
                        if(err) reject(err); else resolve(result.rows);
                    });
                });
            });
        
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
        This function is meant for exports.
    */
    findByTerritoireId: function(territoireId){        
        return databaseP.then(function(db){
            var query = resource_annotations
                .select(
                    resource_annotations.star()
                )
                .where(
                    resource_annotations.territoire_id.equals(territoireId),
                    // expression_domain_id.isNotNull() is for the temporary case where prepareResourceForTerritoire 
                    // is only partially done (resource created, but expression domain not yet)
                    resource_annotations.expression_domain_id.isNotNull(),
                    // should be:
                    //    resource_annotations.approved.equals(true)
                    // but for now that we don't crawl, so:
                    resource_annotations.approved.equals(true).or(resource_annotations.approved.isNull())
                )
                .toQuery();

            //console.log('ResourceAnnotations findByTerritoireId query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    },
    
    /*        
        This function is mainly meant for CSV exports.
    */
    findApprovedByTerritoireId: function(territoireId){    
        //console.log('findApprovedByTerritoireId', territoireId);
        
        return databaseP.then(function(db){
            var query = resource_annotations
                .select( resource_annotations.star() )
                .where(
                    resource_annotations.territoire_id.equals(territoireId).and(
                        resource_annotations.approved.equals(true).and(
                            resource_annotations.values.isNotNull()
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
