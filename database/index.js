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
var GetExpressionTasks = require('../postgresDB/GetExpressionTasks');

var PageGraph = require('../common/graph/PageGraph');
var pageGraphToDomainGraph = require('../common/graph/pageGraphToDomainGraph');



module.exports = {
    Users: Users,
    Territoires: Territoires,
    Queries: Queries,
    Oracles: Oracles,
    OracleCredentials: OracleCredentials,
    QueryResults: QueryResults,
    Expressions : Expressions,
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
            
            crawlTodoCountP.then(function(res){
                console.log('crawlTodoCountP', res)
            }).catch(function(err){
                console.error('crawlTodoCountP err', err);
            })
            
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
            var territoireP = Territoires.findById(territoireId);
            var relevantQueriesP = Queries.findByBelongsTo(territoireId);
            
            var queryReadyP = relevantQueriesP.then(function(queries){
                return Promise.all(queries.map(function(q){
                    return QueryResults.findLatestByQueryId(q.id).then(function(queryResults){
                        q.oracleResults = queryResults && queryResults.results;
                    });
                }));
            });
            
            var pageGraphP = this.getTerritoireGraph(territoireId)
            
            throw 'TODO: hydrate';
            .then(function(){
                    console.timeEnd('buildGraph');
                    console.time('hydrateExpressions');
                    var ids = new Set();
                
                    nodes.forEach(function(expr){
                        if(expr.id !== undefined)
                            ids.add(expr.id);
                    });
                    
                    return Expressions.getExpressionsWithContent(ids).then(function(expressions){
                        expressions.forEach(function(completeExpression){
                            var uri = completeExpression.uri;
                            var currentExpression = nodes.get(uri);
                            nodes.set(uri, Object.assign(currentExpression, completeExpression));
                        });
                    });
                })
            
            var resultListByPageP = pageGraphP.then(function(pageGraph){
                var results = [];

                pageGraph.nodes.forEach(function(n){
                    results.push({
                        title: n.title,
                        url: n.url,
                        excerpt: n.excerpt,
                        depth: n.depth,
                        expressionId: n.expressionId
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
        */
        getGraphFromRootURIs: function(rootURIs){
            //console.log('getGraphFromRootURIs', rootURIs.toJSON());
            
            var nodes = new StringMap/*<url, expression>*/(); // these are only canonical urls
            var potentialEdges = new Set();
            
            // (alias => canonical URL) map
            var urlToCanonical = new StringMap/*<url, url>*/();
            
            function buildGraph(urls, depth){
                console.time('buildGraph');
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
                    
                    // add references
                    expressions.forEach(function(expr){
                        var uri = expr.uri;
                        
                        if(Array.isArray(expr.references)){
                            expr.references.forEach(function(refURL){
                                if(!nodes.has(refURL)){
                                    // create shallow node
                                    nodes.set(refURL, {
                                        uri: refURL,
                                        depth: -1
                                    });
                                }
                                
                                potentialEdges.add({
                                    source: uri,
                                    target: refURL
                                });
                                
                                if(!nodes.has(refURL) && !urlToCanonical.has(refURL))
                                    nextURLs.add(refURL);
                            });
                        }
                    });
                    
                    
                    if(nextURLs.size >= 1){
                        return buildGraph(nextURLs, depth+1);
                    }
                    //console.timeEnd(timeKey);

                });
            }
            
            return buildGraph(rootURIs, 0)
                .then(function(){
                    console.timEnd('hydrateExpressions');
                    console.time('PageGraph');
                    var pageGraph = new PageGraph();
                
                    var nextNodeName = (function(){
                        var next = 0;

                        return function(){
                            return 'n'+(next++);
                        };
                    })();
                    
                
                    var urlToNodeName = new StringMap();
                
                    nodes.forEach(function(expr, url){
                        var name = nextNodeName();
                        
                        pageGraph.addNode(name, {
                            url: url,
                            title: expr.title || '',
                            content_length: (expr.main_text || '').length,
                            depth: expr.depth,
                            expressionId: typeof expr.id === "number" ? expr.id : -1
                        });
                        
                        urlToNodeName.set(url, name);
                    });
                    
                    potentialEdges.forEach(function(e){
                        var source = urlToCanonical.get(e.source) || e.source;
                        var target = urlToCanonical.get(e.target) || e.target;
                        
                        var sourceNode = pageGraph.getNode(urlToNodeName.get(source));
                        var targetNode = pageGraph.getNode(urlToNodeName.get(target));
                        
                        if(sourceNode && targetNode)
                            pageGraph.addEdge(sourceNode, targetNode, { weight: 1 });
                    });
                    
                    console.timeEnd('PageGraph');
                    
                    return pageGraph;
                });
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
