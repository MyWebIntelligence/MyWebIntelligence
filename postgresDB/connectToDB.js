"use strict";

var pg = require('pg');

var conString;

if(process.env.NODE_ENV === 'dev-docker' || process.env.NODE_ENV === 'production'){
    conString = "postgres://postgres:password@mywipostgres:5432/postgres";
}
else{
    if(process.env.NODE_ENV === 'test')
        conString = "postgres://postgres:password@localhost:6666/postgres";
    else
        conString = "postgres://postgres:password@localhost:5555/postgres";
}

console.log('conString', conString);

module.exports = function(){
    return new Promise(function(resolve, reject){
        var client = new pg.Client(conString);
        client.connect(function(err) {
            if(err) reject(err); else resolve(client);
        });
    });
};
