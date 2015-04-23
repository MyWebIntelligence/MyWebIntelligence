"use strict";

var pg = require('pg');

var conString = process.env.NODE_ENV === 'dev-docker' || process.env.NODE_ENV === 'production' ?
    "postgres://postgres:password@mywipostgres:5432/postgres" :
    "postgres://postgres:password@localhost:5555/postgres";

console.log('conString', conString);

module.exports = function(){
    return new Promise(function(resolve, reject){
        var client = new pg.Client(conString);
        client.connect(function(err) {
            if(err) reject(err); else resolve(client);
        });
    });
};
