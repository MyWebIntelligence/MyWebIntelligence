"use strict";

var sql = require('sql');
sql.setDialect('postgres');

var databaseP = require('../management/databaseClientP');

var tasks = require('../management/declarations.js').tasks;

var databaseJustCreatedSymbol = require('./databaseJustCreatedSymbol');
var justCreatedMarker = {};
justCreatedMarker[databaseJustCreatedSymbol] = true;

module.exports = {
    create: function(data){
        return databaseP.then(function(db){
            
            var query = tasks
                .insert(data)
                .toQuery();

            //console.log('query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(Object.assign(err, {query: query}));
                    else resolve( result.rows.map(function(r){
                        return Object.assign( r, justCreatedMarker );
                    }) )
                });
            });
        })
    },
    
    /*
        urls is a Set<url>
    */
    createTasksTodo: function(resourceId, territoireId, type, depth){
        //console.log('Tasks.createTasksTodo', resourceId, territoireId, type, depth)
        
        return databaseP.then(function(db){
            var query = tasks
                .insert({
                    status: 'todo',
                    resource_id: resourceId, 
                    territoire_id: territoireId,
                    depth: depth,
                    type: type
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
    },
    
    pickTasks: function(count){
        // console.log('pickTasks', count);
        
        return databaseP.then(function(db){
            // http://stackoverflow.com/a/11568880            
            
            var subSelect = tasks
                .subQuery()
                .select(tasks.id)
                .where(
                    tasks.status.equals('todo').or(
                        tasks.status.equals('in progress').and(tasks.literal("now() > updated_at + interval '1 hour'"))
                    )
                )
                .limit(count)
                .forUpdate();
            
            var query = tasks
                .update({
                    status: 'in progress'
                })
                .where(tasks.id.in( subSelect ))
                .returning('*')
                .toQuery();
            
            // console.log('Annotation tasks pickTasks query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        });
    },
    
    /*
        tasksData: Set<Task>
    */
    setTodoState: function(tasksData){
        return databaseP.then(function(db){
            var taskIds = tasksData.toJSON().map(function(t){ return t.id; });
            
            var query = tasks
                .update({
                    status: 'todo'
                })
                .where(tasks.id.in( taskIds ))
                .toQuery();
            
            // console.log('Annotation tasks pickTasks query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        });
        
    },
    
    delete: function(id){
        return databaseP.then(function(db){
            var query = tasks
                .delete()
                .where(tasks.id.equals(id))
                .returning('*')
                .toQuery();
            
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
            
            var query = tasks
                .select('*')
                .toQuery();
            
            //console.log('query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        });
    },
    
    
    deleteAll: function(){
        throw 'TODO';
    }
    
};
