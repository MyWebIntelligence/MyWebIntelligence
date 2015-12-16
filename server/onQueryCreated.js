"use strict";

var database = require('../database');
var interogateOracle = require('../oracles/interogateOracle');
var cleanupURLs = require('../common/cleanupURLs');

module.exports = function onQueryCreated(query, user){
    console.log("onQueryCreated", query.name, query.belongs_to, user.name);
    
    return database.Oracles.findById(query.oracle_id)
        .then(function(oracle){
            var oracleOptions = query.oracleOptions ? JSON.parse(query.oracleOptions) : undefined;
        
            if(oracle.credentials_infos){
                return database.OracleCredentials.findByUserAndOracleId(user.id, oracle.id).then(function(uoCreds){
                    return interogateOracle(oracle, query.q, oracleOptions, uoCreds.credentials);
                });
            }
            else{
                return interogateOracle(oracle, query.q, oracleOptions);
            }
        })
        .then(function(queryResults){
        
            var cleanQueryResults = new Set(cleanupURLs(queryResults.toJSON()));
        
            console.log('query.belongs_to', query.belongs_to)
        
            return Promise.all([
                database.QueryResults.create({
                    query_id: query.id,
                    results: queryResults.toJSON(), // store the exact results returned by the oracle
                    created_at: new Date()
                }),
                database.Resources.findByURLsOrCreate(cleanQueryResults)
                    .then(function(resources){
                        return Promise._allResolved(resources.map(function(r){
                            return database.Tasks.createTasksTodo(r.id, query.belongs_to, 'prepare_resource', 0);
                        }))
                    })
            ]);
        })
        .catch(function(err){
            console.error('onQueryCreated error', err, err.stack);
        });
};
