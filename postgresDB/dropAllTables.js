"use strict";

var fs = require('fs');

var databaseP = require('./databaseClientP');

var dropTableScript = fs.readFileSync( require.resolve('./dropAllTables.sql') ).toString();

module.exports = function(){
    console.warn('WARNING! Dropping all tables!');
    
    return new Promise(function(resolve, reject){
        databaseP.then(function(db){
            db.query(dropTableScript, function(err, result) {
                if(err) reject(err); else resolve(result);
            });
        }).catch(resolve);
    });
};
