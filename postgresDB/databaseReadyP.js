"use strict";

var createTables = require('./createTables');
var databaseP = require('./databaseClientP');

module.exports = databaseP
    .then(createTables)
    .then(function(){ return databaseP; }); // to return the pg "client" object used to send queries
