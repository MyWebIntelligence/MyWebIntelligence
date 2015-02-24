"use strict";

var Users = require('./models/Users');
var Territoires = require('./models/Territoires');
var Queries = require('./models/Queries');
var Oracles = require('./models/Oracles');
var OracleCredentials = require('./models/OracleCredentials');
var QueryResults = require('./models/QueryResults');
var Aliases = require('./models/Aliases');
var Expressions = require('./models/Expressions');
var References = require('./models/References');

module.exports = {
    Users: Users,
    Territoires: Territoires,
    Queries: Queries,
    Oracles: Oracles,
    OracleCredentials: OracleCredentials,
    QueryResults: QueryResults,
    Aliases: Aliases,
    Expressions : Expressions,
    References : References,
    
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
                    return QueryResults.findByQueryId(q.id).then(function(queryResults){
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
            var nodes = new Set();
            var potentialEdges = new Set();
            
            var getCanonicalURLP = Aliases.getAll().then(function(all){
                var aliasMap = new Map();
                
                all.forEach(function(alias){
                    aliasMap.set(alias.source, alias.target);
                })
                
                return function(url){
                    return aliasMap.get(url) || url;
                };
            });
            
            function keepURLsWithAnExpression(urls){
                return Expressions.findByURIs(urls).then(function(exps){
                    return new Set(exps.map(function(e){ return e.uri }));
                })
            }
            
            return getCanonicalURLP
                .then(function(getCanonicalURL){

                    // urls correspond to new URLs to retrieve relations from, maybe
                    return (function buildGraph(urls){
                        return keepURLsWithAnExpression(urls).then(function(urlsWithExpression){
                            urlsWithExpression.forEach(function(u){
                                nodes.add(u);
                            });

                            var nextURLs = new Set();

                            return References.findBySourceURIs(urlsWithExpression).then(function(refs){
                                refs.forEach(function(r){
                                    var canonicalSource = r.source; // already is canonical
                                    var canonicalTarget = getCanonicalURL(r.target);

                                    if(!nodes.has(canonicalTarget) && !nextURLs.has(canonicalTarget))
                                        nextURLs.add(canonicalTarget);

                                    potentialEdges.add({
                                        source: canonicalSource,
                                        target: canonicalTarget
                                    });
                                });

                                if(nextURLs.size >= 1){
                                    return buildGraph(nextURLs);
                                }

                            });

                        });

                    })(rootURIs);

                })
                .then(function(){
                    var edges = new Set();

                    potentialEdges.forEach(function(e){
                        if(nodes.has(e.source) && nodes.has(e.target))
                            edges.add(e);
                    })

                    return {
                        nodes: nodes,
                        edges: edges
                    };
                });
        },
        
        /*
            This returns a graph of pages
            The url is the URL after redirects
        */
        getQueryGraph: function(queryId){
            console.log('getQueryGraph', queryId);
            
            var self = this;
            
            QueryResults.findLatestByQueryId(queryId)
                .then(function(qRes){
                    return self.getGraphFromRootURIs( new Set(qRes.results) );
                });
        }
    }
};