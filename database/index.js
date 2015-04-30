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
                        currentUser: user,
                        oracles: oracles
                    };
                });
            });
        },
        
        /*
            Query search results
        */
        getTerritoireScreenData: function(territoireId){
            var territoireP = Territoires.findById(territoireId);
            var relevantQueries = Queries.findByBelongsTo(territoireId);
            
            var queryReadyP = relevantQueries.then(function(queries){
                return Promise.all(queries.map(function(q){
                    return QueryResults.findLatestByQueryId(q.id).then(function(queryResults){
                        q.oracleResults = queryResults.results;
                    });
                }));
            });
            
            var pageGraphP = this.getTerritoireGraph(territoireId)
            
            var resultListByPageP = pageGraphP.then(function(pageGraph){
                var results = [];

                pageGraph.nodes.forEach(function(n){
                    results.push({
                        title: n.title,
                        url: n.url,
                        excerpt: n.excerpt
                    });
                });

                return results;
            });
            
            var resultListByDomainP = pageGraphP.then(pageGraphToDomainGraph).then(function(domainGraph){
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
            
            return Promise.all([
                territoireP, relevantQueries, resultListByPageP, resultListByDomainP, queryReadyP
            ]).then(function(res){
                var territoire = res[0];
                
                territoire.queries = res[1];
                territoire.resultListByPage = res[2];
                territoire.resultListByDomain = res[3];
                
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
            
            function buildGraph(urls){
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
                        
                        nodes.set(uri, expr);
                        
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
                                        uri: refURL
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
                        return buildGraph(nextURLs);
                    }
                    //console.timeEnd(timeKey);

                });
            }
            
            return buildGraph(rootURIs)
                .then(function(){
                    console.timeEnd('buildGraph');
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
                            excerpt: expr["meta_description"]  || '',
                            //publication_date: expr.publication_date,
                            content: expr.main_text  || '',
                            content_length: (expr.main_text || '').length
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
                    return self.getGraphFromRootURIs( new Set(qRes.results) );
                });
        },
        
        getTerritoireGraph: function(territoireId){
            console.log('getTerritoireGraph', territoireId);
            
            var self = this;
            
            return Queries.findByBelongsTo(territoireId)
                .then(function(queries){
                    return Promise.all(queries.map(function(q){
                        return QueryResults.findLatestByQueryId(q.id);
                    }));
                })
                .then(function(queriesResults){
                    var roots = [];
                
                    queriesResults.forEach(function(qRes){
                        roots = roots.concat(qRes.results);
                    });
                
                    return self.getGraphFromRootURIs( new Set(roots) );
                });
        }
            
    }
};
