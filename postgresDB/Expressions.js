"use strict";

var databaseP = require('./databaseClientP');

var serializeValueForDB = require('./serializeValueForDB');
var serializeObjectForDB = require('./serializeObjectForDB');

/*
    Expressions contain large bodies of content. This API is designed so that most "get/find" methods only return "structure" fields.
    To get the content, use getExpressionsWithContent(ids)
*/

module.exports = {
    create: function(expressionData){
        return databaseP.then(function(db){
            var res = serializeObjectForDB(Object.assign(
                {},
                expressionData,
                {references: expressionData.references.toJSON()}
            ));
            var serializedKeys = res.serializedKeys;
            var serializedValues = res.serializedValues;
            
            var query = [
                "INSERT INTO",
                "expressions",
                "("+serializedKeys+")",
                "VALUES",
                "("+serializedValues.join(', ')+")"
            ].join(' ') + ';';

            //console.log('Expressions create query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result);
                });
            });
        })
    },
    
    findByURIAndAliases: function(uris){
        return databaseP.then(function(db){
            var uriDisjunction = uris.toJSON()
                .map(function(uri){
                    var serializedURIForDB = serializeValueForDB(uri);
                    
                    return [
                        serializedURIForDB,
                        ' = uri',
                        'OR',
                        serializedURIForDB,
                        '= ANY("aliases")'
                    ].join(' ');
                })
                .join(' OR ');
            
            
            var query = [
                'SELECT id, uri, "references", "aliases" FROM',
                "expressions",
                "WHERE",
                "("+uriDisjunction+")"
            ].join(' ') + ';';
            
            //console.log('query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        });
    },
    
    findByCanonicalURI: function(uri){
        return databaseP.then(function(db){
            
            var query = [
                'SELECT id, uri, "references", "aliases" FROM',
                "expressions",
                "WHERE",
                "uri = "+serializeValueForDB(uri)
            ].join(' ') + ';';
            
            //console.log('query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        });
    },
    
    /* ids: set of ids */
    getExpressionsWithContent: function(ids){
        return databaseP.then(function(db){
            
            var query = [
                'SELECT * FROM',
                "expressions",
                "WHERE",
                "id IN ("+ids.toJSON().map(serializeValueForDB).join(',')+')'
            ].join(' ') + ';';
            
            //console.log('query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        });
    }
    
    update: function(expressionData){
        // UPDATE weather SET temp_lo = temp_lo+1, temp_hi = temp_lo+15, prcp = DEFAULT WHERE city = 'San Francisco' AND date = '2003-07-03';
        return databaseP.then(function(db){
            var keys = Object.keys(expressionData);
            var serializedSETs = keys.map(function(k){
                if(k === 'id')
                    return undefined;

                var serK = '"'+k+'"'
                var v = expressionData[k];
                return serK + ' = ' + serializeValueForDB(v);
            }).filter(function(v){ return !!v; }).join(', ');

            var query = [
                "UPDATE",
                "expressions",
                "SET",
                serializedSETs,
                "WHERE",
                "id = "+expressionData.id
            ].join(' ') + ';';

            //console.log('query', query);

            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result);
                });
            });
        });
    },
    
    deleteAll: function(){
        // doesn't delete anything yet
        return Promise.resolve();
    }
    
};
