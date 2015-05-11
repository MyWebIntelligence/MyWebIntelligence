"use strict";

var databaseP = require('./databaseClientP');

var serializeValueForDB = require('./serializeValueForDB');
var serializeObjectForDB = require('./serializeObjectForDB');
var serializeObjectKeysForDB = require('./serializeObjectKeysForDB');
var serializeObjectValues = require('./serializeObjectValues');

module.exports = {
    create: function(data){
        return databaseP.then(function(db){
            var res = serializeObjectForDB(data);
            var serializedKeys = res.serializedKeys;
            var serializedValues = res.serializedValues;
            
            var query = [
                "INSERT INTO",
                "get_expression_tasks",
                "("+serializedKeys+")",
                "VALUES",
                "("+serializedValues.join(', ')+")"
            ].join(' ') + ';';

            //console.log('query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result);
                });
            });
        })
    },
    /*
        urls is a Set<url>
    */
    createTasksTodo: function(urls, territoireId){
        console.log('createTasksTodo', urls.size);
        
        if(urls.size === 0)
            return Promise.resolve(); // don't bother the db
        
        return databaseP.then(function(db){

            var dataArray = urls.toJSON().map(function(url){
                return {
                    uri: url,
                    status: 'todo',
                    related_territoire_id: territoireId
                };
            });

            var keys = Object.keys(dataArray[0]);
            var serializedKeys = serializeObjectKeysForDB(keys);

            var serializedMultipleValues = dataArray
                .map(function(data){
                    return "(" + serializeObjectValues(data, keys) + ")"
                })
                .join(', ');

            var query = [
                "INSERT INTO",
                "get_expression_tasks",
                "("+serializedKeys+")",
                "VALUES",
                serializedMultipleValues
            ].join(' ') + ';';

            //console.log('query', query);

            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err){ reject(err); console.error('createTasksTodo error', err) } else resolve(result);
                });
            });
            
        });
    },
    
    pickTasks: function(count){
        // console.log('pickTasks', count);
        
        return databaseP.then(function(db){
            // http://stackoverflow.com/a/11568880            
            
            var query = [
                "UPDATE",
                "get_expression_tasks",
                "SET",
                "status = 'getting expression'",
                "WHERE",
                "id IN (SELECT id FROM get_expression_tasks WHERE status = 'todo' LIMIT "+count+" FOR UPDATE)",
                "RETURNING *"
            ].join(' ') + ';';
            
            // console.log('pickTasks query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        });
    },
    
    delete: function(id){
        return databaseP.then(function(db){
            var query = [
                "DELETE FROM",
                "get_expression_tasks",
                "WHERE",
                "id = " + serializeValueForDB(id),
                "RETURNING *"
            ].join(' ') + ';';
            
            //console.log('query', query);
            
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        });
    },
    
    getCrawlTodoCount: function(territoireId){
        
        return databaseP.then(function(db){
            var query = [
                "SELECT count(*) FROM",
                "get_expression_tasks",
                "WHERE",
                "related_territoire_id = " + serializeValueForDB(territoireId)
            ].join(' ') + ';';
            
            // console.log('query', territoireId, query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve( Number(result.rows[0].count) );
                });
            });
        });
        
    },
    
    /*findByCanonicalURI: function(uri){
        return databaseP.then(function(db){
            
            var query = [
                "SELECT * FROM",
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
    },*/
    
    /*update: function(expressionData){
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
    },*/
    
    deleteAll: function(){
        // doesn't delete anything yet
        return Promise.resolve();
    }
    
};
