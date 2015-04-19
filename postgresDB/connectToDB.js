"use strict";

var pg = require('pg');

var conString = "postgres://postgres:password@localhost:5555/postgres";

module.exports = function(){
    return new Promise(function(resolve, reject){
        var client = new pg.Client(conString);
        client.connect(function(err) {
            if(err) reject(err); else resolve(client);
        });
    });
};
