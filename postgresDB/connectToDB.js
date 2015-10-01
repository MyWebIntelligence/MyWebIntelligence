"use strict";

var pg = require('pg');

var conStringByNODE_ENV = {
    // with docker-compose
    "development":  "postgres://postgres:password@db:5432/postgres", // default NODE_ENV value
    "experimental": "postgres://postgres:password@db:5432/postgres",
    "test":         "postgres://postgres:password@db:5432/postgres",
    
    // without docker-compose (yet)
    "dev-docker":   "postgres://postgres:password@mywi-dev-db:5432/postgres",
    "stable":       "postgres://postgres:password@mywi-stable-db:5432/postgres"
}

var conString = conStringByNODE_ENV[process.env.NODE_ENV];

if(!conString){
    console.error('No connection string for NODE_ENV', process.env.NODE_ENV);
    process.exit();
}

console.log('conString', conString);

module.exports = function(){
    return new Promise(function(resolve, reject){
        var client = new pg.Client(conString);
        client.connect(function(err) {
            if(err) reject(err); else resolve(client);
        });
    })
        
};
