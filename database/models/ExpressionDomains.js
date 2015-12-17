"use strict";

var sql = require('sql');
sql.setDialect('postgres');

var databaseP = require('../management/databaseClientP');

var massageExpressionDomain = require('./massageExpressionDomain');

var databaseJustCreatedSymbol = require('./databaseJustCreatedSymbol');
var justCreatedMarker = {};
justCreatedMarker[databaseJustCreatedSymbol] = true;

var expression_domains = require('../management/declarations.js').expression_domains;


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
                        return Object.assign( massageExpressionDomain(r), justCreatedMarker );
                    }) );
                });
            });
        })
    },
    
    findOrCreateByName: function(name){
        var self = this;
        
        return databaseP.then(function(db){
            var query = expression_domains
                .select( expression_domains.star() )
                .where(
                    expression_domains.name.equal(name)
                )
                .toQuery();

            //console.log('Resources findByURL query', query);
            
            return (new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            }))
                .then(function(r){
                    return r ?
                        r : 
                        self.create({name: name}).then(function(ress){ return ress[0] });
                });
        });
    },
    
    
    findByName: function(name){
        return databaseP.then(function(db){
            var query = expression_domains
                .select( expression_domains.star() )
                .where( expression_domains.name.equals(name) )
                .toQuery();

            //console.log('ResourceAnnotations findById query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(massageExpressionDomain(result.rows[0]));
                });
            });
        })
    },
    
    /*
        ids is a Set<ExpressionDomainId>
    */
    findByExpressionDomainIds: function(ids){
        return databaseP.then(function(db){
            var query = expression_domains
                .select( expression_domains.star() )
                .where( expression_domains.id.in(ids.toJSON()) )
                .toQuery();

            //console.log('ResourceAnnotations findById query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(massageExpressionDomain(result.rows));
                });
            });
        })
    },
    
    update: function(id, expressionDomainsDelta){
        return databaseP.then(function(db){
            var query = expression_domains
                .update(expressionDomainsDelta)
                .where(expression_domains.id.equal(id))
                .toQuery();

            //console.log('ResourceAnnotations findById query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result);
                });
            });
        })
    }
    
};
