"use strict";

var database = require('../database');
var crawl = require('../crawl')

module.exports = function onQueryCreated(query){
    console.log("onQueryCreated", query);
    
    database.Oracles.findById(newQuery.oracle_id).then(function(oracle){
        console.log('oracle found', oracle.name, user.name, newQuery.q);

        if(oracle.needsCredentials){
            return database.OracleCredentials.findByUserAndOracleId(user.id, oracle.id).then(function(oracleCredentials){
                console.log('oracle credentials', oracle.name, user.name, newQuery.q, oracleCredentials);

                // temporarily hardcoded. TODO generalize in the future
                var oracleFunction = oracleModules[oracle.oracleNodeModuleName]({
                    "API key": oracleCredentials["API key"],
                    cx: oracleCredentials["cx"]
                });

                return oracleFunction(newQuery.q).then(function(searchResults){
                    console.log('GCSE oracle results for', newQuery.q, searchResults.length);
                    return database.QueryResults.create({
                        query_id: newQuery.id,
                        results: searchResults,
                        created_at: new Date()
                    });
                });
            }).catch(function(err){
                console.error('oracling after credentials err', err);
            });
        }
        else{
            throw 'TODO';
        }
    }).catch(function(err){
        console.error('oracling err', err);
    });
}