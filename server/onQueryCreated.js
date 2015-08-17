"use strict";

var db = require('../database');
var interogateOracle = require('../oracles/interogateOracle');
var createResourceTasks = require('./createResourceTasks');
var cleanupURLs = require('../common/cleanupURLs');

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
        
            var cleanQueryResults = new Set(cleanupURLs(queryResults.toJSON()));
        
            return Promise.all([
                db.QueryResults.create({
                    query_id: query.id,
                    results: queryResults.toJSON(), // store the exact results returned by the oracle
                    created_at: new Date()
                }),
                db.Resources.findByURLsOrCreate(cleanQueryResults)
                    .then(function(resources){
                        return createResourceTasks(new Set(resources.map(function(r){ return r.id; })), {
                            territoireId: query.belongs_to,
                            depth: 0
                        });
                    })
                
            ]);
        })
        .catch(function(err){
            console.error('onQueryCreated error', err, err.stack);
        });
};
