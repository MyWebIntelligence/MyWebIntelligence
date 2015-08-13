"use strict";

var pg = require('pg');

var conStringByNODE_ENV = {
    "test":         "postgres://postgres:password@localhost:5600/postgres",
    "development":  "postgres://postgres:password@db:5432/postgres", // default NODE_ENV value
    "dev-docker":   "postgres://postgres:password@mywi-dev-db:5432/postgres",
    "experimental": "postgres://postgres:password@mywi-experimental-db:5432/postgres",
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
