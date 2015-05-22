"use strict";

var sql = require('sql');

var databaseP = require('./databaseClientP');

var serializeValueForDB = require('./serializeValueForDB');

/*
    Expressions contain large bodies of content. This API is designed so that most "get/find" methods only return "structure" fields.
    To get the content, use getExpressionsWithContent(ids)
*/

var expressions = sql.define({
    name: 'expressions',
    columns: ['id', 'main_html', 'main_text', 'title', 'meta_description']
});


module.exports = {
    // expressionData is an array
    create: function(expressionData){
        if(typeof expressionData.id === "number")
            throw new Error('Expression.create. Data already has an id '+expressionData.id+' '+expressionData.uri)
            
        return databaseP.then(function(db){
            var query = expressions
                .insert(expressionData)
                .returning('id')
                .toQuery();

            //console.log('Expressions create query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
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
                    if(err) reject(err); else resolve(result.rows);
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
