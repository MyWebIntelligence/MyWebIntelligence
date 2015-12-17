"use strict";

var resolve = require('path').resolve;

var oracleDescriptions = require('./oracleDescriptions.json');
var oracleModules = new Map();

oracleDescriptions.forEach(function(o){
    var modulePath = resolve(__dirname, o.oracle_node_module_name);
    
    try{
        oracleModules.set(o.oracle_node_module_name, require(modulePath));
    }
    catch(e){
        console.error('Oracle module', modulePath, 'could not be found');
        process.exit();
    }
});

module.exports = function(oracle, q, oracleOptions, credentials){
    console.log('Interogate oracle', oracle, q, oracleOptions, credentials);
    
    var oracleFunction = oracle.credentials_infos ?
        oracleModules.get(oracle.oracle_node_module_name)(credentials) :
        oracleModules.get(oracle.oracle_node_module_name);
    
    return oracleFunction(q, oracleOptions).then(function(searchResults){
        console.log('oracle results for', q, searchResults.size);
        return searchResults;
    });
};
