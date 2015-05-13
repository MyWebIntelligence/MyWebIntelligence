"use strict";

var databaseP = require('./databaseClientP');

var serializeValueForDB = require('./serializeValueForDB');
var serializeObjectForDB = require('./serializeObjectForDB');

/*
    Expressions contain large bodies of content. This API is designed so that most "get/find" methods only return "structure" fields.
    To get the content, use getExpressionsWithContent(ids)
*/

function uniformizeExpression(e){
    if(e === undefined)
        return undefined;
    else{
        e.references = new Set(e.references);
        return e;
    }
}

module.exports = {
    create: function(expressionData){
        if(typeof expressionData.id === "number")
            throw new Error('Expression.create. Data already has an id '+expressionData.id+' '+expressionData.uri)
            
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
                    if(err) reject(err); else resolve(uniformizeExpression(result));
                });
            });
        })
    },
    
    findByURIAndAliases: function(uris){
        return databaseP.then(function(db){
            
            var parenthezisedURIs = uris.toJSON().map(function(uri){
                return '('+serializeValueForDB(uri)+')'
            });
            
            var valuesExpr = [
                '(VALUES',
                parenthezisedURIs.join(', '),
                ')',
                'v(url)'
            ].join(' ');
            
            var query = [
                'SELECT id, uri, "references", "aliases" FROM',
                "expressions, ",
                valuesExpr,
                "WHERE",
                "url = uri",
                "OR",
                'url = ANY("aliases")'
            ].join(' ') + ';';
            
            //console.log('findByURIAndAliases query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows.map(uniformizeExpression));
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
                    if(err) reject(err);
                    else resolve(uniformizeExpression(result.rows[0]));
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
            
            //console.log('getExpressionsWithContent query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows.map(uniformizeExpression));
                });
            });
        });
    },
    
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
        return Promise.reject('not implemented');
    }
    
};
