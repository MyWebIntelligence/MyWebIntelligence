"use strict";

var db = require('../../database');
var onQueryCreated = require('../../server/onQueryCreated');

var oP = db.Oracles.findByOracleNodeModuleName('GCSE');
var uP = db.Users.findById(68451720);

oP.then(function(oracle){
        return oracle.id;
    })
    .then(function(GCSEOracleId){
        return db.Queries.create({
            "name": "Asthme",
            "q": "Asthme",
            "lang": "none",
            "nbPage": 400,
            "oracle_id": GCSEOracleId,
            "belongs_to": 'nope'
        });
    })
    .then(function(query){
        return uP.then(function(user){
            console.time('onQueryCreated');
            return onQueryCreated(query, user);
        });
    })
    .then(function(){
        console.timeEnd('onQueryCreated');
    })
    .catch(function(err){
        console.error('onQueryCreated manual test error', error); 
    });



// create query
// call onQueryCreate

