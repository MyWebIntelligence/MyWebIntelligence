"use strict";

var Users = require('./models/Users');
var Territoires = require('./models/Territoires');
var Queries = require('./models/Queries');
var Oracles = require('./models/Oracles');
var OracleCredentials = require('./models/OracleCredentials');
var QueryResults = require('./models/QueryResults');
var Expressions = require('./models/Expressions');

var GraphModel = require('../common/graph/GraphModel');
var pageNodeDesc = {
    // Node attributes description
    /*"domain": {
        type: "string"
    },*/
    "url": {
        type: "string"
    },
    "title": {
        type: "string"
    },
    "excerpt": {
        type: "string"
    }/*,
    "publication_date": {
        type: "string"
    }*/,
    "content": {
        type: "string"
    },
    "content_length": {
        type: "integer"
    }
};

var pageEdgeDesc = {};


module.exports = {
    Users: Users,
    Territoires: Territoires,
    Queries: Queries,
    Oracles: Oracles,
    OracleCredentials: OracleCredentials,
    QueryResults: QueryResults,
    Expressions : Expressions,
    
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
            
            return Promise.all([territoireP, relevantQueries, queryReadyP]).then(function(res){
                var territoire = res[0];
                var queries = res[1];
                
                territoire.queries = queries;
                
                return territoire;
            });
        },
        
        /*
            uris: Set<string>
        */
        getGraphFromRootURIs: function(rootURIs){
            //console.log('getGraphFromRootURIs', rootURIs._toArray());
            
            var nodes = new Map/*<url, expression>*/(); // these are only canonical urls
            var potentialEdges = new Set();
            
            // (alias => canonical URL) map
            var urlToCanonical = new Map/*<url, url>*/();
            
            function buildGraph(urls){
                return Expressions.findByURIAndAliases(urls).then(function(expressions){
                    //console.log('building graph, found expressions', expressions.length, expressions.map(function(e){ return e.uri}));
                    
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

                });
            }
            
            return buildGraph(rootURIs)
                .then(function(){
                    var pageGraph = new GraphModel(pageNodeDesc, pageEdgeDesc);
                
                    var nextNodeName = (function(){
                        var next = 0;

                        return function(){
                            return 'n'+(next++);
                        };
                    })();
                    
                
                    var urlToNodeName = new Map();
                
                    nodes.forEach(function(expr, url){
                        var name = nextNodeName();
                        
                        pageGraph.addNode(name, {
                            url: url,
                            title: expr.title,
                            excerpt: expr["meta-description"],
                            //publication_date: expr.publication_date,
                            content: expr.mainText,
                            content_length: expr.mainText.length
                        });
                        
                        urlToNodeName.set(url, name);
                    });
                    
                    potentialEdges.forEach(function(e){
                        var source = urlToCanonical.get(e.source) || e.source;
                        var target = urlToCanonical.get(e.target) || e.target;
                        
                        var sourceNode = pageGraph.getNode(urlToNodeName.get(source));
                        var targetNode = pageGraph.getNode(urlToNodeName.get(target));
                        
                        if(sourceNode && targetNode)
                            pageGraph.addEdge(sourceNode, targetNode, { width: 1 });
                    });
                    
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
