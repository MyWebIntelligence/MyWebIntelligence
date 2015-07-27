"use strict";

var sql = require('sql');
sql.setDialect('postgres');

var databaseP = require('./databaseClientP');

var resources = require('./declarations.js').resources;

var isValidResourceExpression = resources.other_error.isNull()
    .and(resources.http_status.lt(400).or(resources.http_status.isNull()))

module.exports = {
    /*
        urls is a Set<url>
    */
    create: function(urls){
        return databaseP.then(function(db){
            var query = resources
                .insert(urls.toJSON().map(function(url){
                    return {
                        url: url
                    };
                }))
                .returning('*')
                .toQuery();

            //console.log('Resources create query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(Object.assign(err, {query: query})); else resolve(result.rows);
                });
            });
        })
    },
    
    /*
        urls is a Set<url>
    */
    update: function(resourceId, resourceData){
        return databaseP.then(function(db){
            var query = resources
                .update(resourceData)
                .where(resources.id.equal(resourceId))
                .toQuery();

            //console.log('Resources create query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    },
    
    findByURLOrCreate: function(url){
        var self = this;
        
        return databaseP.then(function(db){
            var query = resources
                .select('*')
                .from(resources)
                .where(
                    resources.url.equal(url)
                )
                .toQuery();

            //console.log('Resources findByURL query', query);
            
            return (new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            }))
                .then(function(resourcesObjs){
                    var r = resourcesObjs[0];
                
                    return r ?
                        r : 
                        self.create(new Set([url])).then(function(ress){ return ress[0] });
                });
        });
    },
    
    /*
        urls is a Set<url>
    */
    findByURLsOrCreate: function(urls){
        var self = this;
        
        var resourcesP = urls.toJSON().map(function(url){
            var resourceP = self.findByURLOrCreate(url);
            
            // in findByURLOrCreate, by the time the create happens, the resource might have been already created
            // by someone else, so the promise might be rejected with "duplicate key contraint nia nia nia" error
            // on error, just give another try. Give up if this one doesn't work.
            return resourceP.catch(function(){
                return self.findByURLOrCreate(url);
            });
        });
        
        // best effort. If creating a resource for all wasn't possible, let it go.
        return Promise._allResolved(resourcesP).then(function(ress){
            return ress.filter(function(res){ return res !== undefined; });
        });
    },
    
    /*
        urls is a Set<url>
    */
    findByURLs: function(urls){
        return databaseP.then(function(db){
            var query = resources
                .select('*')
                .from(resources)
                .where(
                    resources.url.in(urls.toJSON())
                )
                .toQuery();

            //console.log('Resources findByURL query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    },
    
    /*
        urls is a Set<url>
    */
    findValidByURLs: function(urls){
        return databaseP.then(function(db){
            var query = resources
                .select(resources.star())
                .where(
                    resources.url.in(urls.toJSON()).and(
                        isValidResourceExpression
                    )
                )
                .toQuery();

            //console.log('Resources findValidByURLs query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    },
    
    /*
        ids is a Set<ResourcesId>
    */
    findValidByIds: function(ids){
        return databaseP.then(function(db){
            var query = resources
                .select(resources.star())
                .where(
                    resources.id.in(ids.toJSON()).and(
                        isValidResourceExpression
                    )
                )
                .toQuery();

            //console.log('Resources findById query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        })
    },
    
    /*
        returns Promise<ResourceId> for the target ResourceId (to later associate an expression if necessary)
    */
    addAlias: function(fromResourceId, toURL){
        var self = this;
        
        // find the target by URL or create one if none exists  
        return this.findValidByURLs(new Set([toURL]))
            .then(function getTargetResourceId(res){
                var targetResource = res[0];

                if(!targetResource){
                    return self.create(new Set([toURL])).then(function(resourceIds){
                        return resourceIds[0].id;
                    });
                }

                return targetResource.id;
            })
            .then(function(targetResourceId){
                return databaseP.then(function(db){
                    var query = resources
                        .update({
                            alias_of: targetResourceId
                        })
                        .where(resources.id.equal(fromResourceId))
                        .returning('id')
                        .toQuery();

                    //console.log('Resources addAlias update query', query);

                    return new Promise(function(resolve, reject){
                        db.query(query, function(err){
                            if(err) reject(err); else resolve(targetResourceId);
                        });
                    });
                })
            });
    },
    
    updateHttpStatus: function(resourceId, status){
        return databaseP.then(function(db){
            var query = resources
                .update({
                    http_status: status
                })
                .where(resources.id.equal(resourceId))
                .toQuery();

            //console.log('Resources addAlias update query', query);

            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        });
    },
    
    associateWithExpression: function(resourceId, expressionId){
        return databaseP.then(function(db){
            var query = resources
                .update({
                    expression_id: expressionId
                })
                .where(resources.id.equal(resourceId))
                .toQuery();

            //console.log('Resources addAlias update query', query);

            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        });
    },
    
    deleteAll: function(){
        return databaseP.then(function(db){
            var query = resources
                .delete()
                .toQuery();

            //console.log('Resources deleteAll query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result);
                });
            });
        })
    }
    
};
