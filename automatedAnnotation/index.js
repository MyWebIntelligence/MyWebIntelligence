"use strict";

var os = require('os');
var child_process = require('child_process');
var fork = child_process.fork;
var exec = child_process.exec;

var MAXIMUM_NICENESS = 19;

// initial automated annotation processes creation
os.cpus().slice(0, 1).map(function(){
    var worker = fork(require.resolve('./worker.js')); 
    
    // Setting super-low priority so this CPU-intensive task doesn't get in the way of the server or
    // other more important tasks
    exec( ['renice', '-n', MAXIMUM_NICENESS, worker.pid].join(' ') );
        
    return worker;
});

/*
    urls: Set<url>
*/
module.exports = function addAutomatedAnnotationTasks(urls){
    if(typeof urls === 'string'){
        // single url. 
        urls = new Set([urls]);
    }
    
    
};
