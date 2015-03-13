"use strict";

var db = require('../database');
var interogateOracle = require('../oracles/interogateOracle');
var crawl = require('../crawl');
var persistCrawlResult = require('../crawl/persistCrawlResult');


module.exports = function onQueryCreated(query, user){
    console.log("onQueryCreated", query.name, user.name);
    
    return db.Oracles.findById(query.oracle_id)
        .then(function(oracle){
            var oracleOptions = query.oracleOptions ? JSON.parse(query.oracleOptions) : undefined;
        
            if(oracle.needsCredentials){
                return db.OracleCredentials.findByUserAndOracleId(user.id, oracle.id).then(function(creds){
                    return interogateOracle(oracle, query.q, oracleOptions, creds);
                });
            }
            else{
                return interogateOracle(oracle, query.q, oracleOptions);
            }
        })
        .then(function(queryResults){
            db.QueryResults.create({
                query_id: query.id,
                results: queryResults._toArray(),
                created_at: new Date()
            });
            // don't wait for the results to be stored in database to start crawling
            return crawl(queryResults, new Set(query.q.split(" ")));
        })
        .then(persistCrawlResult)
        .catch(function(err){
            console.error('onQueryCreated error', err, err.stack);
        });
};
