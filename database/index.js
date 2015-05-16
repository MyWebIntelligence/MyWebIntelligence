"use strict";

var StringMap = require('stringmap');

// JSON database models
var Users = require('./models/Users');
var Territoires = require('./models/Territoires');
var Queries = require('./models/Queries');
var Oracles = require('./models/Oracles');
var OracleCredentials = require('./models/OracleCredentials');
var QueryResults = require('./models/QueryResults');

// PostGREs models
var Expressions = require('../postgresDB/Expressions');
var Resources = require('../postgresDB/Resources');
var GetExpressionTasks = require('../postgresDB/GetExpressionTasks');

var pageGraphToDomainGraph = require('../common/graph/pageGraphToDomainGraph');
var abstractGraphToPageGraph = require('../common/graph/abstractGraphToPageGraph');
var getGraphExpressions = require('../common/graph/getGraphExpressions')(Expressions);

module.exports = {
    Users: Users,
    Territoires: Territoires,
    Queries: Queries,
    Oracles: Oracles,
    OracleCredentials: OracleCredentials,
    QueryResults: QueryResults,
    Expressions : Expressions,
    Resources: Resources,
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
            var crawlTodoCountP = GetExpressionTasks.getCrawlTodoCount(territoireId);
            
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
            var MAX_EXCERPT_LENGTH = 300;
            
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
                .then(getGraphExpressions);
            
            var pageGraphP = Promise.all([abstractPageGraphP, expressionByIdP])
                .then(function(res){
                    var abstractPageGraph = res[0];
                    var expressionById = res[1];
                    return abstractGraphToPageGraph(abstractPageGraph, expressionById);
                });

            
            var resultListByPageP = Promise.all([abstractPageGraphP, expressionByIdP])
                .then(function(res){
                    var abstractPageGraph = res[0];
                    var expressionById = res[1];
                    var results = [];

                    abstractPageGraph.nodes.forEach(function(n){
                        var expressionId = String(n.id); // strinigfy because expressionById is a StringMap        
                        var expression = Object.assign(
                            {}, 
                            n,
                            expressionById.get(expressionId)
                        );
                        
                        results.push({
                            title: expression.title,
                            url: expression.uri,
                            excerpt: (expression.meta_description && expression.meta_description.slice(0, MAX_EXCERPT_LENGTH))
                                    || (expression.main_text && expression.main_text.slice(0, MAX_EXCERPT_LENGTH)),
                            depth: expression.depth,
                            expressionId: expression.id
                        });
                    });

                    return results;
                });
            
            var resultListByDomainP = pageGraphP
                .then(function(pageGraph){
                    console.time('pageGraphToDomainGraph');
                    return pageGraphToDomainGraph(pageGraph);
                })
                .then(function(domainGraph){
                    console.timeEnd('pageGraphToDomainGraph');
                    var results = [];

                    domainGraph.nodes.forEach(function(n){
                        results.push({
                            domain: n.title,
                            url: 'http://'+n.title+'/',
                            count: n.nb_expressions
                        });
                    });

                    return results;
                });
            
            // timing of this query will make the values certainly out-of-sync with when 
            var progressIndicatorsP = this.getProgressIndicators(territoireId);
            
            
            return Promise.all([
                territoireP, relevantQueriesP, resultListByPageP, resultListByDomainP, progressIndicatorsP, queryReadyP
            ]).then(function(res){
                var territoire = res[0];
                
                territoire.queries = res[1];
                territoire.resultListByPage = res[2];
                territoire.resultListByDomain = res[3];
                territoire.progressIndicators = res[4];
                
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
            var PERIPHERIC_DEPTH = 10000;
            
            //console.log('getGraphFromRootURIs', rootURIs.toJSON());
            
            var nodes = new StringMap/*<url, expression>*/(); // these are only canonical urls
            var edges = new Set();
            
            // (alias => canonical URL) map
            var urlToCanonical = new StringMap/*<url, url>*/();
            
            function buildGraph(urls, depth){
                console.time('buildGraph');
                //console.log('buildGraph', urls.size, depth);

                //var dbtimeKey = ['findByURIAndAliases', urls.size, 'urls'].join(' ');
                //console.time(dbtimeKey)
                return Expressions.findByURIAndAliases(urls).then(function(expressions){
                    //console.timeEnd(dbtimeKey)
                    //console.log('building graph, found expressions', expressions.length, expressions.map(function(e){ return e.uri}));
                    //var timeKey = ['process', expressions.length, 'expressions'].join(' ');
                    //console.time(timeKey);
                    // fill in nodes
                    expressions.forEach(function(expr){
                        var uri = expr.uri;
                        
                        nodes.set(uri, Object.assign({
                            depth: depth
                        }, expr));
                        
                        if(Array.isArray(expr.aliases)){
                            expr.aliases.forEach(function(a){
                                urlToCanonical.set(a, uri);
                            });
                        }
                    });
                    
                    var nextURLs = new Set();
                    //console.log('building nextURLs', nodes.keys(), urlToCanonical.keys());
                    
                    // add references
                    expressions.forEach(function(expr){
                        var uri = expr.uri;
                        
                        if(expr.references){
                            expr.references.forEach(function(refURL){
                                // do the nodes.has(refURL) test *before* creating a shallow node below
                                if(!nodes.has(refURL) && !urlToCanonical.has(refURL))
                                    nextURLs.add(refURL);
                                
                                if(!nodes.has(refURL)){
                                    // create shallow node
                                    nodes.set(refURL, {
                                        uri: refURL,
                                        depth: PERIPHERIC_DEPTH
                                    });
                                }
                                
                                edges.add({
                                    source: uri,
                                    target: refURL
                                });

                            });
                        }
                    });
                    
                    //console.log('buildGraph nextURLs.size', nextURLs.size);
                    if(nextURLs.size >= 1){
                        return buildGraph(nextURLs, depth+1);
                    }
                    //console.timeEnd(timeKey);

                });
            }
            
            return buildGraph(rootURIs, 0).then(function(){
                // edges may contain non-canonical URLs in the target because of how it's built. Converting before returning
                edges.forEach(function(e){
                    e.target = urlToCanonical.get(e.target) || e.target;
                });
                
                console.timeEnd('buildGraph');
                return {
                    nodes: nodes,
                    edges: edges
                };
            })
                
        },
        
        /*
            This returns a graph of pages
            The url is the URL after redirects
        */
        getQueryGraph: function(queryId){
            console.log('getQueryGraph', queryId);
            
            var self = this;
            
            return QueryResults.findLatestByQueryId(queryId)
                .then(function(qRes){
                    return self.getGraphFromRootURIs( new Set(qRes ? qRes.results : []) );
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
        }
            
    }
};
