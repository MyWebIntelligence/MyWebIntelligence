"use strict";

var Promise = require('es6-promise').Promise;

require('../nodePolyfills');

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
        }
    }
};