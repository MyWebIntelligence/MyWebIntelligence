"use strict";

require('../ES-mess');
//require('better-log').install();

/*
    Using zlib doesn't work. Alexa zip yields a "header check error"... sigh...
    The code is a hack. It fetches the zip, store it as a file, unzip the file with the OS unzip utility, then pipes to
    a csv parser stream. Rows are stored in the database
*/

var fs = require('fs');
var spawn = require('child_process').spawn;

var request = require('request');
var csv = require('csv-parser');
var through = require('through');
var tmp = require('tmp');

var database = require('../database');


var ALEXA_TOP_1M_URL = "http://s3.amazonaws.com/alexa-static/top-1m.csv.zip";


function unzipToStream(pathToZip){

    var args = ["-c", pathToZip];

    console.log('unzip', args.join(' '));

    var unzipProc = spawn('unzip', args);

    unzipProc.on('exit', function(){
        console.log('unzip exit')
    });

    unzipProc.on('error', function(error){
        console.log('unzip error', error)
    });

    return unzipProc.stdout;
}


/*
    
// 500 => 329.756ms
// 1000 => 275.082ms
*/
var CREATE_CHUNK_SIZE = 1000;

function saveByChunk(entries){
    return entries.length === 0 ? undefined : database.AlexaRankCache.create(entries.slice(0, CREATE_CHUNK_SIZE))
        .then(function(){
            return saveByChunk(entries.slice(CREATE_CHUNK_SIZE))
        });
}

console.time('databaseFilled');
var databaseFilledP = new Promise(function(resolve, reject){

    var tmpFile = tmp.fileSync().name;
    console.log('tmpFile', tmpFile);
    
    var entries = [];
    
    
    request({
        method: 'GET',
        uri: ALEXA_TOP_1M_URL
    })
        .pipe(fs.createWriteStream(tmpFile))
        .on('finish', function() {
            console.log('finish');
            var downloadDate = (new Date()).toISOString();

            var dataStream = unzipToStream(tmpFile);

            dataStream
                .pipe(csv({
                    separator: ',',
                    headers: ['rank', 'site_domain']
                }))
                .pipe(through(function(row){
                    var rank = Number(row.rank);
                
                    // some entries are garbage. They should just be skipped.
                    if(!Number.isNaN(rank)){ 
                        row.rank = rank;

                        entries.push(Object.assign({
                            download_date: downloadDate
                        }, row));
                    }
                        
                }))
                .on('end', function() {
                    saveByChunk(entries)
                        .then(resolve)
                        .catch(reject);
                
                    fs.unlinkSync(tmpFile)
                });
        })
})


databaseFilledP
    .then(function(){
        console.log('the end')
        console.timeEnd('databaseFilled');
        process.kill();
    })
    .catch(function(error){
        console.error('error during databaseFilledP', error, error.stack)
        process.kill();
    });

(function showCount(){
    setTimeout(function(){
        database.AlexaRankCache.count()
            .then(function(count){
                console.log('count', count);
                showCount();
            })
    }, 4000)
})();


process.on('uncaughtException', function(err){
    console.error('uncaught', err, err.stack);
});
