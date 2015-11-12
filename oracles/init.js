"use strict";

console.log('Initializing oracles');

var database = require('../database');
var oracleDescriptions = require('./oracleDescriptions.json');

module.exports = Promise.all(oracleDescriptions.map(function(o){
    // check if entry with oracleNodeModuleName exists. If not, create it.
    // by oracleNodeModuleName because names may be localized in the future. Module names likely won't ever.
    return database.Oracles.findByOracleNodeModuleName(o.oracleNodeModuleName).then(function(result){
        if(!result)
            return database.Oracles.create(o);
        // else an entry exist, nothing to do.
    });
}))
.catch(function(err){
    console.error("Oracles init error", err);
    process.kill();
});

