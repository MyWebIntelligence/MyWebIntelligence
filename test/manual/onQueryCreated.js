"use strict";

require('../../ES-mess');
process.title = 'crawl + graph';
process.env.NODE_ENV = 'test';

var fs = require('fs');
var path = require('path');

var db = require('../../database');
var dropAllTables = require('../../postgresDB/dropAllTables');
var createTables = require('../../postgresDB/createTables');

var onQueryCreated = require('../../server/onQueryCreated');

//var gcseCreds = require('./gcse-credentials.json');
var list = fs.readFileSync(path.join(__dirname, '../../list-30.txt')).toString();


var cleanDBP = Promise.all([
    db.QueryResults.deleteAll(),
    dropAllTables().then(createTables)
]);

var oP = cleanDBP.then(function(){
    console.log('clean db');
    return db.Oracles.findByOracleNodeModuleName('URLList');
}).catch(function(err){
    console.error('clean db err', err);
});
// need a user with GCSE credentials
var uP = db.Users.create({
    name: 'David'
});

var queryId;


oP.then(function(oracle){
        return oracle.id;
    })
    .then(function(GCSEOracleId){
        console.log('MANUAL', 1, GCSEOracleId);
        return db.Queries.create({
            "name": "Asthme",
            "q": "Asthme",
            "oracle_id": GCSEOracleId,
            "belongs_to": 123456,
            "oracleOptions": JSON.stringify({list: list.split('\n').slice(0, 3)})
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
    
        /*setTimeout(function(){
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
        
        }, 30*1000);*/
        
    })
    .catch(function(err){
        console.error('onQueryCreated manual test error', error); 
    });


