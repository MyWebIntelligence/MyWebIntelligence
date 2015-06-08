"use strict";

var sql = require('sql');
sql.setDialect('postgres');

var databaseP = require('./databaseClientP');

var serializeValueForDB = require('./serializeValueForDB');

var getExpressionTasks = require('./declarations.js').get_expression_tasks;

module.exports = {
    create: function(data){
        return databaseP.then(function(db){
            
            var query = getExpressionTasks
                .insert(data)
                .toQuery();

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
    createTasksTodo: function(resourceIds, territoireId, depth){
        depth = depth || 0;
        //console.log('createTasksTodo', resourceIds.size, depth);
        
        if(resourceIds.size === 0)
            return Promise.resolve(); // don't bother the db
        
        return databaseP.then(function(db){

            var createdTasksPs = resourceIds.toJSON().map(function(resourceId){
                var query = getExpressionTasks
                    .insert({
                        resource_id: resourceId,
                        status: 'todo',
                        related_territoire_id: territoireId,
                        depth: depth
                    })
                    .toQuery();
                
                //console.log('query', query);
                
                return new Promise(function(resolve, reject){
                    db.query(query, function(err, result){
                        // some queries will fail with "duplicate key contraint nia nia nia" error because
                        // resource_id is UNIQUE. That's ok. Impossible to know ahead of time.
                        if(err){ reject(err); } else resolve(result);
                    });
                });
            });

            
            return Promise._allResolved(createdTasksPs);
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
    
    getAll: function(){
        return databaseP.then(function(db){
            
            var query = getExpressionTasks
                .select('*')
                .from(getExpressionTasks)
                .toQuery();
            
            //console.log('query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        });
    },
    
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
