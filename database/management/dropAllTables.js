"use strict";

var fs = require('fs');

var databaseP = require('./databaseClientP');

var dropTableScript = fs.readFileSync( require.resolve('./dropAllTables.sql') ).toString();

module.exports = function(){
    if(process.env.NODE_ENV !== 'test')
        console.warn('\n\t=====\n\nWARNING! Dropping all tables!\n\n\t=====\n');
    
    return new Promise(function(resolve, reject){
        databaseP.then(function(db){
            db.query(dropTableScript, function(err, result) {
                if(err) reject(err); else resolve(result);
            });
        }).catch(resolve);
    });
};
