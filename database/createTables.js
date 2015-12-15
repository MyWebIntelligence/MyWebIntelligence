"use strict";

var fs = require('fs');

var databaseP = require('./databaseClientP');

var createTableScript = fs.readFileSync( require.resolve('./createTables.sql') ).toString();

module.exports = function(){
    return new Promise(function(resolve, reject){
        databaseP.then(function(db){
            db.query(createTableScript, function(err, result) {
                if(err) reject(err); else resolve(result);
            });
        }).catch(resolve);
    });
};
