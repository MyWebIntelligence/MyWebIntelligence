"use strict";

var StringMap = require('stringmap');

// JSON database models
var Users = require('./models/Users');
var Territoires = require('./models/Territoires');
var Queries = require('./models/Queries');
var Oracles = require('./models/Oracles');
var OracleCredentials = require('./models/OracleCredentials');
var QueryResults = require('./models/QueryResults');

var databaseP = require('../postgresDB/databaseClientP');
var declarations = require('../postgresDB/declarations.js');

// PostGREs models
var Expressions = require('../postgresDB/Expressions');
var Resources = require('../postgresDB/Resources');
var Links = require('../postgresDB/Links');
var GetExpressionTasks = require('../postgresDB/GetExpressionTasks');
var AlexaRankCache = require('../postgresDB/AlexaRankCache');


var getGraphExpressions = require('../common/graph/getGraphExpressions')(Expressions);
var simplifyExpression = require('../server/simplifyExpression');


var getExpressionTasks = declarations.get_expression_tasks;


module.exports = {
    Users: Users,
    Territoires: Territoires,
    Queries: Queries,
    Oracles: Oracles,
    OracleCredentials: OracleCredentials,
    QueryResults: QueryResults,
    Expressions : Expressions,
    Links : Links,
    Resources: Resources,
    AlexaRankCache: AlexaRankCache,
    GetExpressionTasks: GetExpressionTasks,
    
    clearAll: function(){
        var self = this;
        
        var deleteAllFunctions = Object.keys(self)
            .map(function(k){
                if(typeof self[k].deleteAll === 'function')
                    return self[k].deleteAll.bind(self[k]);
            })
            .filter(function(v){ return !!v; });

        return Promise.all(deleteAllFunctions.map(function(f){ return f(); }));
    },
    
    complexQueries: {
        getUserInitData: function(userId){
            var userP = Users.findById(userId);
            var relevantTerritoiresP = Territoires.findByCreatedBy(userId);
            var oraclesP = Oracles.getAll();
            
            return Promise.all([userP, relevantTerritoiresP, oraclesP]).then(function(res){
                var user = res[0];
                var relevantTerritoires = res[1];
                var oracles = res[2].map(function(o){ delete o.oracleNodeModuleName; return o; });
                
                var territoiresReadyPs = relevantTerritoires.map(function(t){
                    return Queries.findByBelongsTo(t.id).then(function(queries){
                        t.queries = queries;
                    });
                });
                
                user.territoires = relevantTerritoires;
                user.pictureURL = user.google_pictureURL;
                
                return Promise.all(territoiresReadyPs).then(function(){
                    return {
                        user: user,
                        oracles: oracles
                    };
                });
            });
        },
        
        getProgressIndicators: function(territoireId){
            var queryResultsP = this.getTerritoireQueryResults(territoireId);
            var crawlTodoCountP = this.getCrawlTodoCount(territoireId);
            
            return Promise.all([ queryResultsP, crawlTodoCountP ]).then(function(res){
                return {
                    queriesResultsCount: res[0].size,
                    crawlTodoCount: res[1]
                }
            });
        },
        
        /*
            Query search results
        */
        getTerritoireScreenData: function(territoireId){
            console.log('getTerritoireScreenData', territoireId);
            
            var territoireP = Territoires.findById(territoireId);
            var relevantQueriesP = Queries.findByBelongsTo(territoireId);
            
            var queryReadyP = relevantQueriesP.then(function(queries){
                return Promise.all(queries.map(function(q){
                    return QueryResults.findLatestByQueryId(q.id).then(function(queryResults){
                        q.oracleResults = queryResults && queryResults.results;
                    });
                }));
            });
            
            var abstractPageGraphP = this.getTerritoireGraph(territoireId);
            
            var expressionByIdP = abstractPageGraphP
                .then(getGraphExpressions)
                .then(function(expressionById){
                    Object.keys(expressionById).forEach(function(id){
                        expressionById[id] = simplifyExpression(expressionById[id]);
                    });
                    return expressionById;
                });
            
            // timing of this query will make the values certainly out-of-sync with when 
            var progressIndicatorsP = this.getProgressIndicators(territoireId);
            
            
            return Promise.all([
                territoireP, relevantQueriesP, abstractPageGraphP, progressIndicatorsP, expressionByIdP, queryReadyP
            ]).then(function(res){
                var territoire = res[0];
                
                territoire.queries = res[1];
                territoire.graph = res[2];
                territoire.progressIndicators = res[3];
                territoire.expressionById = res[4];
                
                return territoire;
            });
        }, 
        
        
        /*
            uris: Set<string>
            @returns an abstract graph
            Nodes are url => (partial) expression 
            Edges are {source: Node, target: Node}
        */
        getGraphFromRootURIs: function(rootURIs){
            
            //var PERIPHERIC_DEPTH = 10000;
            
            //console.log('getGraphFromRootURIs', rootURIs.toJSON());
            
            var nodes = new StringMap/*<ResourceIdStr, resource>*/(); // these are only canonical urls
            var edges = new Set();
            
            // (alias => canonical ResourceId) map
            var aliasToCanonicalResourceId = new StringMap/*<ResourceIdStr, ResourceIdStr>*/();
            
            function buildGraph(resourceIds, depth){
                console.time('buildGraph');

                return Resources.findValidByIds(resourceIds).then(function(resources){
                    // console.log('building graph, found resources', resources.length);
                    
                    // create nodes for non-alias
                    resources.forEach(function(res){
                        if(res.alias_of !== null)
                            return;
                        
                        var idKey = String(res.id);
                        
                        nodes.set(idKey, Object.assign({
                            depth: depth
                        }, res));
                    });
                    
                    
                    // find which resource have an expression 
                    var resourcesWithExpression = resources.filter(function(r){
                        return r.expression_id !== null;
                    });
                    //console.log('resourcesWithExpression', resourcesWithExpression.length, '/', resources.length);

                    // find which resource are an alias
                    var aliasResources = resources.filter(function(r){
                        return r.alias_of !== null;
                    });
                    var aliasTargetIds = new Set(aliasResources.map(function(r){
                        aliasToCanonicalResourceId.set(String(r.id), String(r.alias_of));
                        return r.alias_of;
                    }));
                    var aliasRetryBuildGraphP = aliasTargetIds.size >= 1 ?
                        buildGraph(aliasTargetIds, depth) : // same depth on purpose
                        Promise.resolve();
                    
                    
                    var nextDepthGraphP = Links.findBySources(new Set(resourcesWithExpression.map(function(r){
                        return r.id;
                    })))
                        .then(function(links){
                            var nextResourceIds = new Set();

                            links.forEach(function(l){
                                var targetIdStr = String(l.target);

                                if(!nodes.has(targetIdStr) && !aliasToCanonicalResourceId.has(targetIdStr))
                                    nextResourceIds.add(targetIdStr);

                                edges.add({
                                    source: String(l.source),
                                    target: targetIdStr
                                });
                            });

                            if(nextResourceIds.size >= 1)
                                return buildGraph(nextResourceIds, depth+1);
                        });
                    
                    return Promise.all([aliasRetryBuildGraphP, nextDepthGraphP]);
                });
            }
            
            return Resources.findValidByURLs(rootURIs).then(function(resources){
                var ids = new Set( resources.map(function(r){ return r.id; }) );
                
                return buildGraph(ids, 0).then(function(){
                    // edges may contain non-canonical URLs in the target because of how it's built. Converting before returning
                    edges.forEach(function(e){
                        e.target = Number(aliasToCanonicalResourceId.get(e.target) || e.target);
                        e.source = Number(e.source);
                    });

                    console.timeEnd('buildGraph');
                    return {
                        nodes: nodes,
                        edges: edges,
                        toJSON: function(){
                            return {
                                nodes: nodes.values(),
                                edges: edges
                            }
                        }
                    };
                })
            });  
        },
        
        getTerritoireQueryResults: function(territoireId){
            
            return Queries.findByBelongsTo(territoireId)
                .then(function(queries){
                    return Promise.all(queries.map(function(q){
                        return QueryResults.findLatestByQueryId(q.id);
                    }));
                })
                .then(function(queriesResults){
                    var terrResults = [];
                
                    queriesResults.forEach(function(qRes){
                        terrResults = terrResults.concat(qRes ? qRes.results : []);
                    });
                
                    return new Set(terrResults);
                });
        }, 
        
        getTerritoireGraph: function(territoireId){
            console.log('getTerritoireGraph', territoireId);
            
            var self = this;
            
            return this.getTerritoireQueryResults(territoireId).then(function(roots){
                return self.getGraphFromRootURIs( roots );
            });
        },
        
        getCrawlTodoCount: function(territoireId){
            
            var self = this;
            
            return databaseP.then(function(db){
                
                var queryByTerritoireId = getExpressionTasks
                    .select( getExpressionTasks.resource_id )
                    .from(getExpressionTasks)
                    .where(getExpressionTasks.related_territoire_id.equal(territoireId))
                    .toQuery();
                
                
                var tasksForTerritoireIdP = new Promise(function(resolve, reject){
                    db.query(queryByTerritoireId, function(err, result){
                        if(err) reject(err); else resolve( result.rows );
                    });
                });
                
                var tasksForQueryResultsP = self.getTerritoireQueryResults(territoireId)
                    .then(function(urls){
                        return Resources.findByURLs(urls)
                            .then(function(resources){
                                return resources.map(function(r){ return r.id });
                            });
                    })
                    .then(function(resourceIds){
                        var queryByQueryResults = getExpressionTasks
                            .select( getExpressionTasks.resource_id )
                            .from(getExpressionTasks)
                            .where(getExpressionTasks.resource_id.in(resourceIds))
                            .toQuery();
                        
                        return new Promise(function(resolve, reject){
                            db.query(queryByQueryResults, function(err, result){
                                if(err) reject(err); else resolve( result.rows );
                            });
                        });
                    });
                
                
                return Promise.all([ tasksForTerritoireIdP, tasksForQueryResultsP ])
                    .then(function(res){
                        var rids0 = res[0].map(function(t){ return t.resource_id});
                        var rids1 = res[1].map(function(t){ return t.resource_id});
                    
                        var uniqueTaskIds = new Set(rids0.concat(rids1));
                    
                        return uniqueTaskIds.size;
                    })
                
            });
            
        }
        
    }
            
};
