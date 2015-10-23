"use strict";

var os = require('os');
var child_process = require('child_process');
var fork = child_process.fork;
var exec = child_process.exec;

var database = require('../database');

var MAXIMUM_NICENESS = 19;

var SECOND = 1000; // ms
var MINUTE = 60*SECOND;

var WORKER_LIFE_DURATION = 15*MINUTE;

var workers = new Set();


setInterval(function(){
    database.Tasks.getAll()
        .then(function(tasks){
            console.log('There are', tasks.length, 'tasks');
        })
}, 1*MINUTE);


function createWorker(){
    console.log('Creating Task Worker...');
    var worker = fork(require.resolve('./worker.js')); 
    
    var startTime = Date.now();
    
    worker.on('exit', function(){
        console.log('Task worker', worker.pid, 'is dead. Respawning another one.')
        workers.delete(worker);
        createWorker();
    });
    
    // kill the worker after some time.
    // Workers have been found to slow down and even die after some time, likely from
    // memory exhaustion. Let's just kill them before that happens so they can respawn
    setTimeout(function(){
        console.log(
            'Killing task worker', worker.pid, 'after', 
            ((Date.now() - startTime)/MINUTE).toFixed(1),
            'minutes'
        );
        worker.kill('SIGTERM');        
    }, WORKER_LIFE_DURATION)
    
    // Setting super-low priority so this CPU-intensive process doesn't get in the way of the server or
    // other more important tasks
    exec( ['renice', '-n', MAXIMUM_NICENESS, worker.pid].join(' ') );
    
    workers.add(worker);
}


// initial automated annotation processes creation
os.cpus().slice(0, 2).forEach(createWorker);
