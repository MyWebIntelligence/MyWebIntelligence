"use strict";

var sql = require('sql');
sql.setDialect('postgres');

var databaseP = require('./databaseClientP');

var databaseJustCreatedSymbol = require('./databaseJustCreatedSymbol');
var justCreatedMarker = {};
justCreatedMarker[databaseJustCreatedSymbol] = true;

var expression_domain_annotations = require('./declarations.js').expression_domain_annotations;

module.exports = {

    create: function(annotationData){
        if(!Array.isArray(annotationData))
            annotationData = [annotationData];
        
        return databaseP.then(function(db){
            var query = expression_domain_annotations
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
    
    update: function(expressionDomainId, territoireId, userId, delta){
        
        return databaseP
        .then(function(db){
            
            delta = Object.assign(
                {},
                delta,
                // just making user a smart user won't override these in the delta
                {
                    expression_domain_id: expressionDomainId,
                    territoire_id: territoireId,
                    user_id: userId
                }
            );
            
            var query = expression_domain_annotations
                .update(delta)
                .where(
                    expression_domain_annotations.expression_domain_id.equals(expressionDomainId),
                    expression_domain_annotations.territoire_id.equals(territoireId)
                )
                .toQuery();

            //console.log('ExpressionDomainAnnotations update query', query);

            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        });
        
    },
    
    /*        
        This function is meant for exports.
    */
    findByTerritoireId: function(territoireId){        
        return databaseP.then(function(db){
            var query = expression_domain_annotations
                .select( expression_domain_annotations.star() )
                .where( expression_domain_annotations.territoire_id.equals(territoireId) )
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
        
    */
    findByExpressionDomainId: function(id){        
        return databaseP.then(function(db){
            var query = expression_domain_annotations
                .select( expression_domain_annotations.star() )
                .where( expression_domain_annotations.expression_domain_id.equals(id) )
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
