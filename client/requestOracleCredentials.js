"use strict";

var page = require('page');

var pendingOracleCredentialsContext = require('./pendingOracleCredentialsContext');

module.exports = function(oracle){
    pendingOracleCredentialsContext.oracle = oracle;
    page('/oracles');
}
