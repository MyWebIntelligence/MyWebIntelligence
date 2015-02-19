"use strict";

require('../../ES-mess');

var db = require('../../database');
var onQueryCreated = require('../../server/onQueryCreated');

var cleanDBP = Promise.all([
    db.QueryResults.deleteAll(),
    db.Aliases.deleteAll(),
    db.Expressions.deleteAll(),
    db.References.deleteAll()
]);

var oP = cleanDBP.then(function(){
    return db.Oracles.findByOracleNodeModuleName('GCSE');
});

// WARNING : this is harcoded. Baaaaad!
// need a user with GCSE credentials
var uP = db.Users.findById(68451720);

var queryId;


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
        }).then(function(q){
            queryId = q.id;
            return q;
        });
    })
    .then(function(query){
        return uP.then(function(user){
            if(!user)
                throw new Error('no user');
            console.time('onQueryCreated');
            return onQueryCreated(query, user);
        });
    })
    .then(function(){
        console.timeEnd('onQueryCreated');
    
        console.time('getting graph');
        return db.complexQueries.getQueryGraph(queryId);
    })
    .then(function(graph){
        console.timeEnd('getting graph');
        console.log('graph', graph.nodes.size, graph.edges.size);
    })
    .catch(function(err){
        console.error('onQueryCreated manual test error', error); 
    })
    .then(function(){
        return Promise.all([
            db.Queries.delete(queryId)
        ]);
    });




