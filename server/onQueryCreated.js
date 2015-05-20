"use strict";

var db = require('../database');
var interogateOracle = require('../oracles/interogateOracle');
var startCrawl = require('./startCrawl');


module.exports = function onQueryCreated(query, user){
    console.log("onQueryCreated", query.name, query.belongs_to, user.name);
    
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
            return Promise.all([
                db.QueryResults.create({
                    query_id: query.id,
                    results: queryResults.toJSON(),
                    created_at: new Date()
                }),
                db.Resources.create(queryResults).then(function(resources){
                    return startCrawl(new Set(resources.map(function(r){ return r.id; })), query.belongs_to);
                })
                // don't wait for the results to be stored in database to start crawling
            ]);
        })
        .catch(function(err){
            console.error('onQueryCreated error', err, err.stack);
        });
};
