"use strict";

var sql = require('sql');
sql.setDialect('postgres');

var databaseP = require('./databaseClientP');

var annotationTasks = require('./declarations.js').annotation_tasks;

module.exports = {
    create: function(data){
        return databaseP.then(function(db){
            
            var query = annotationTasks
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
    createTasksTodo: function(annotationId){
        
        return databaseP.then(function(db){
            var query = annotationTasks
                .insert({
                    status: 'todo',
                    annotation_id: annotationId
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
            
            var subSelect = annotationTasks
                .subQuery()
                .select(annotationTasks.id)
                .where(annotationTasks.status.equals('todo'))
                .limit(count)
                .forUpdate();
            
            var query = annotationTasks
                .update({
                    status: 'in progress'
                })
                .where(annotationTasks.id.in( subSelect ))
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
    
    delete: function(id){
        return databaseP.then(function(db){
            var query = annotationTasks
                .delete()
                .where(annotationTasks.id.equals(id))
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
            
            var query = annotationTasks
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
