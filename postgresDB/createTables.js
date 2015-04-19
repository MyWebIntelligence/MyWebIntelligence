"use strict";

var fs = require('fs');

var createTableScript = fs.readFileSync( require.resolve('./tables.sql') ).toString();

module.exports = function(db){
    return new Promise(function(resolve, reject){
        db.query(createTableScript, function(err, result) {
            if(err) reject(err); else resolve(result);
        });
    })
};
