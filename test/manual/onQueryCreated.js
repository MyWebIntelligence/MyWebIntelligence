"use strict";

require('../../ES-mess');
process.title = 'crawl + graph';

var db = require('../../database');
var dropAllTables = require('../../postgresDB/dropAllTables')
var onQueryCreated = require('../../server/onQueryCreated');

var gcseCreds = require('./gcse-credentials.json');

var cleanDBP = Promise.all([
    db.QueryResults.deleteAll(),
    dropAllTables()
]);

var oP = cleanDBP.then(function(){
    console.log('clean db');
    return db.Oracles.findByOracleNodeModuleName('GCSE');
});
// need a user with GCSE credentials
var uP = db.Users.create({
    name: 'David'
});
var ocP = Promise.all([uP, oP]).then(function(res){
    console.log('users and oracle ready');

    var u = res[0];
    var o = res[1];
    
    return db.OracleCredentials.create(Object.assign(
        {},
        gcseCreds,
        {
            "oracleId": o.id,
            "userId": u.id
        }
    ));
}).catch(function(err){
    console.log('obj creation error', err);
})

var queryId;


ocP.then(function(){
        return oP;
    })
    .then(function(oracle){
        return oracle.id;
    })
    .then(function(GCSEOracleId){
        console.log('MANUAL', 1, GCSEOracleId);
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
        console.log('MANUAL', 2, query);
    
        return uP.then(function(user){
            console.log('MANUAL', 3, user);
            if(!user)
                throw new Error('no user');
            console.time('onQueryCreated');
            return onQueryCreated(query, user);
        });
    })
    .then(function(){
        console.timeEnd('onQueryCreated');
        console.log('MANUAL', 4);
    
        setTimeout(function(){
            console.time('getting graph');
            db.complexQueries.getQueryGraph(queryId)
                .then(function(graph){
                    console.timeEnd('getting graph');
                    console.log('graph', graph.nodes.size, graph.edges.size);
                })
                .then(function(){
                    return Promise.all([
                        db.Queries.delete(queryId)
                    ]);
                })
                .catch(function(err){
                    console.error('onQueryCreated manual test error', error); 
                });
        
        }, 30*1000);
        
    })
    .catch(function(err){
        console.error('onQueryCreated manual test error', error); 
    });


