"use strict";

var cleanupURLs = require('../common/cleanupURLs');

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
var isValidResourceExpression = Resources.isValidResourceExpression;

var Links = require('../postgresDB/Links');
var AlexaRankCache = require('../postgresDB/AlexaRankCache');
var ResourceAnnotations = require('../postgresDB/ResourceAnnotations');
var Tasks = require('../postgresDB/Tasks');
var ExpressionDomains = require('../postgresDB/ExpressionDomains');

var massageExpressionDomain = require('../postgresDB/massageExpressionDomain');


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
    ResourceAnnotations: ResourceAnnotations,
    Tasks: Tasks,
    ExpressionDomains: ExpressionDomains,
    
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
            var territoireTaskCountP = this.getTerritoireTaskCount(territoireId);
            
            return Promise.all([ queryResultsP, territoireTaskCountP ]).then(function(res){
                return {
                    queriesResultsCount: res[0].size,
                    territoireTaskCount: res[1]
                }
            });
        },
        
        
        /*
            graph is an abstract graph
        */
        getGraphAnnotations: function getGraphAnnotations(graph, territoireId){            
            var annotationByResourceId = Object.create(null);

            var resourceIds = new Set();
            
            graph.nodes.forEach(function(node){
                resourceIds.add(node.id);
            });
            
            return resourceIds.size > 0 ? 
                ResourceAnnotations.findByTerritoireId(territoireId)
                    .then(function(annotations){
                        annotations.forEach(function(ann){                        
                            annotationByResourceId[ann.resource_id] = JSON.parse(ann.values);
                            annotationByResourceId[ann.resource_id].expressionDomainId = ann.expression_domain_id;
                        });

                        return annotationByResourceId;
                    }) : 
                Promise.resolve(annotationByResourceId);
        },
        
        
        /*
            graph is an abstract graph
        */
        getTerritoireExpressionDomains: function getGraphExpressionDomains(territoireId){            
            
            var expression_domains = declarations.expression_domains;
            var resource_annotations = declarations.resource_annotations;
            
            return databaseP.then(function(db){
                var query = expression_domains
                    .select('*')
                    .where( expression_domains.id.in(
                        resource_annotations.subQuery()
                            .select(resource_annotations.expression_domain_id.distinct())
                            .where(resource_annotations.territoire_id.equals(territoireId))
                        )
                    )
                    .toQuery();

                //console.log('getTerritoireExpressionDomains query', query);

                return new Promise(function(resolve, reject){
                    db.query(query, function(err, result){
                        if(err) reject(err); else resolve(result.rows.map(massageExpressionDomain));
                    });
                });
            });
            
        },
        
        /*
            resourceIds : Set<ResourceId>
        */
        getExpressionsByResourceIds: function(resourceIds){
            console.log('getExpressionsByResourceIds', resourceIds.size);
            
            var resources = declarations.resources;
            var expressions = declarations.expressions;
            
            console.log()
            
            return databaseP.then(function(db){
                var query = expressions
                    .select(
                        expressions.main_text,
                        expressions.title,
                        expressions.meta_description,
                        resources.id.as('resource_id'),
                        resources.url
                    )
                    .from( resources
                          .join(expressions)
                          .on(resources.expression_id.equals(expressions.id))
                    )
                    .where( resources.id.in(resourceIds.toJSON()) )
                    .toQuery();

                console.log('getTerritoireExpressionDomains query', query);

                return new Promise(function(resolve, reject){
                    db.query(query, function(err, result){
                        if(err) reject(err); else resolve(result.rows.map(massageExpressionDomain));
                    });
                });
            });
            
        },
        
        /*
            rootURIs: Set<url>
            resourceIdBlackList: Set<ResourceId>
            @returns an abstract graph
            Nodes are url => (partial) expression 
            Edges are {source: Node, target: Node}
        */
        getGraphFromRootURIs: function(rootURIs, resourceIdBlackList){
            console.time('getGraphFromRootURIs');
            //var PERIPHERIC_DEPTH = 10000;
            
            //console.log('getGraphFromRootURIs', rootURIs.size, resourceIdBlackList.size);
            
            // Make a resourceIdBlackList copy to safely add elements
            // Added elements here currently only are resources which are part of an alias cycle
            resourceIdBlackList = new Set(resourceIdBlackList); 
            
            var nodes = Object.create(null); // Dictionary<ResourceIdStr, resource> // these are only canonical urls
            var edges = new Set();
            
            // (alias => canonical ResourceId) map
            var aliasToCanonicalResourceId = Object.create(null); // Dictionary<ResourceIdStr, ResourceId>

            // The web is so terrible that it can happens two URLs may redirect to one another
            // thus creating an alias cycle. If these cycles aren't detected and addressed, the buildGraph
            // function recurses indefinitely.
            // The current choice to address this problem is to remove all resources in a cycle from the graph 
            // if such a cycle is detected
            function addAliasOrBreakAliasCycle(fromRid, toRid){
                var candidateCycle = [fromRid, toRid];
                var last = candidateCycle[candidateCycle.length -1];
                
                // This while loop + indexOf on growing array has O(n²) behavior
                // but cycles should never be more than 2-3 elements, so whatev's
                while(
                    last !== undefined &&
                    candidateCycle.slice(0, candidateCycle.length -1).indexOf(last) === -1
                ){
                    last = aliasToCanonicalResourceId[last]
                    candidateCycle.push(last);
                }
                
                if(last === undefined){
                    // no cycle detected
                    aliasToCanonicalResourceId[fromRid] = toRid;
                }
                else{
                    // alias cycle detected
                    var duplicateIndex = candidateCycle.slice(0, candidateCycle.length -1).indexOf(last);
                    
                    var cycle = candidateCycle.slice(duplicateIndex+1);
                    console.log('Alias cycle detected!', cycle);
                    
                    cycle.forEach(function removeFromGraph(rId){
                        resourceIdBlackList.add(rId);
                        
                        delete nodes[rId];
                        
                        edges.forEach(function(e){
                            if(e.source === rId || e.target === rId)
                                edges.delete(e);
                        });
                        
                        delete aliasToCanonicalResourceId[rId];
                    });                    
                }

            }
            
            
            function buildGraph(resourceIds, depth){
                //console.log('buildGraph', resourceIds.size, resourceIds.size <= 5 ? resourceIds.toJSON() : '' )
                //console.time('buildGraph '+resourceIds.size);
                
                //var k = 'findValidByIds '+resourceIds.size;
                //console.time(k);
                return Resources.findValidByIds(resourceIds).then(function(resources){
                    //console.timeEnd(k);
                    
                    // create nodes for non-alias
                    resources.forEach(function(res){
                        if(res.alias_of !== null)
                            return;
                        
                        nodes[res.id] = Object.assign(
                            { depth: depth }, 
                            res
                        );
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
                    
                    resources = undefined; // freeing only reference to this variable
                    
                    var aliasTargetIds = new Set(aliasResources
                        .map(function(r){
                            addAliasOrBreakAliasCycle(r.id, r.alias_of);
                            return r.alias_of;
                        })
                        .filter(function(rid){
                            return !resourceIdBlackList.has(rid);
                        })
                    );
                    var aliasRetryBuildGraphP = aliasTargetIds.size >= 1 ?
                        buildGraph(aliasTargetIds, depth) : // same depth on purpose
                        Promise.resolve();
                    
                    //console.time('Links.findBySources '+resourceIds.size);
                    var nextDepthGraphP = Links.findBySources(new Set(resourcesWithExpression.map(function(r){
                        return r.id;
                    })))
                        .then(function(links){
                            //console.timeEnd('Links.findBySources '+resourceIds.size);
                            var nextResourceIds = [];

                            links.forEach(function(l){
                                var targetId = l.target;

                                if(!(targetId in nodes) && 
                                   !(targetId in aliasToCanonicalResourceId) && 
                                   !resourceIdBlackList.has(l.target))
                                {
                                    nextResourceIds.push(l.target);
                                }

                                edges.add({
                                    source: l.source,
                                    target: targetId
                                });
                            });

                            if(nextResourceIds.length >= 1){
                                return buildGraph(new Set(nextResourceIds), depth+1);
                            }
                        });
                    
                    var resP = Promise.all([aliasRetryBuildGraphP, nextDepthGraphP])
                    //resP.then(console.timeEnd.bind(console, 'buildGraph '+resourceIds.size));
                    
                    return resP;
                });
            }
            
            return Resources.findValidByURLs(rootURIs).then(function(resources){
                var ids = new Set( resources
                    .map(function(r){ return r.id; }) 
                    .filter(function(id){ return !resourceIdBlackList.has(id) })
                );
                resources = undefined; // clearing only reference to this variable
                
                console.log('getGraphFromRootURIs ids', ids.size);
                
                return buildGraph(ids, 0).then(function(){
                    // edges may contain non-canonical URLs in the target because of how it's built. Converting before returning
                    edges.forEach(function(e){
                        e.target = aliasToCanonicalResourceId[e.target] || e.target;
                    });

                    console.timeEnd('getGraphFromRootURIs');
                    return {
                        nodes: Object.keys(nodes).map(function(k){ return nodes[k]; }), // only values
                        edges: edges.toJSON()
                    };
                })
            });  
        },
        
        /*
            urls is a Set<url>
        */
        getValidTerritoireQueryResultResources: function(territoireId){
            var resources = declarations.resources;
            var resource_annotations = declarations.resource_annotations;
            
            return this.getTerritoireQueryResults(territoireId)
                .then(function(urls){// throw 'TODO remove those with an annotation === false' )
            
                //.then(database.Resources.findValidByURLs)
                    return databaseP.then(function(db){
                        var query = resources
                            .select(resources.star())
                            .from(
                                resources
                                    .join(resource_annotations)
                                    .on(resources.id.equals(resource_annotations.resource_id))
                            )
                            .where(
                                resource_annotations.territoire_id.equals(territoireId).and(
                                    resource_annotations.approved.equals(true).and(
                                        resources.url.in(urls.toJSON()).and(
                                            isValidResourceExpression
                                        )
                                    )
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
                })
            
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
                        terrResults = terrResults.concat(qRes ?
                            // cleanup the results before returning them as they may contain relative links or non-http links
                            cleanupURLs(qRes.results) : 
                            []
                        );
                    });
                
                    return new Set(terrResults);
                });
        }, 
        
        getTerritoireGraph: function(territoireId){
            console.log('getTerritoireGraph', territoireId);
            
            var self = this;
            
            return Promise.all([
                this.getTerritoireQueryResults(territoireId),
                ResourceAnnotations.findNotApproved(territoireId)
            ]).then(function(res){
                var roots = res[0];
                var notApprovedAnnotations = res[1];
                
                return self.getGraphFromRootURIs(
                    roots, 
                    new Set(notApprovedAnnotations.map(function(ann){ return ann.resource_id; }))
                );
            });
        },
        
        getTerritoireTaskCount: function(territoireId){
            var tasks = declarations.tasks;
            var TASK_COUNT_KEY = 'task_count';
            
            return databaseP.then(function(db){
                
                var queryByTerritoireId = tasks
                    .select( tasks.star().count().as(TASK_COUNT_KEY) )
                    .where(
                        tasks.territoire_id.equal(territoireId).and(
                            tasks.type.notEqual('prepare_resource')
                        )
                    )
                    .toQuery();
                
                
                return new Promise(function(resolve, reject){
                    db.query(queryByTerritoireId, function(err, result){
                        if(err) reject(err); else resolve( result.rows[0][TASK_COUNT_KEY] );
                    });
                });
                
            });
            
        }
        
    }
            
};
