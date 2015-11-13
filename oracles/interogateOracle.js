"use strict";

var resolve = require('path').resolve;

var oracleDescriptions = require('./oracleDescriptions.json');
var oracleModules = new Map();

oracleDescriptions.forEach(function(o){
    var modulePath = resolve(__dirname, o.oracleNodeModuleName);
    
    try{
        oracleModules.set(o.oracleNodeModuleName, require(modulePath));
    }
    catch(e){
        console.error('Oracle module', modulePath, 'could not be found');
        process.exit();
    }
});

module.exports = function(oracle, q, oracleOptions, credentials){
    console.log('Interogate oracle', oracle, q, oracleOptions, credentials);
    
    var oracleFunction = oracle.needsCredentials ?
        oracleModules.get(oracle.oracleNodeModuleName)(credentials) :
        oracleModules.get(oracle.oracleNodeModuleName);

    return oracleFunction(q, oracleOptions).then(function(searchResults){
        console.log('oracle results for', q, searchResults.size);
        return searchResults;
    });
};
