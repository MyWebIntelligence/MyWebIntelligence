"use strict";

process.title = "MyWI territoireGraphCache-worker";

require('../../ES-mess');


console.log('territoireGraphCache-worker', 'represent!')

var territoireGraphCache = require('./territoireGraphCache');

process.on('message', function(msg){
    //console.log('territoireGraphCache-worker message', msg);
    
    var terrId = msg.territoireId;
    
    territoireGraphCache(terrId)
        .then(function(res){
            process.send(Object.assign({
                territoireId: terrId
            }, res));
        })
        .catch(function(e){
            console.error('territoireGraphCache-worker error', e, e.stack);
        })
});

// An uncaught error in this process once caused an entire application crash...
process.on('uncaughtException', function(err){
    console.error('Uncaught error in territoire cache worker', err, err.stack);
});
