"use strict";

require('../ES-mess');
process.title = "MyWI crawler";

var crawl = require('./core-crawl');
var ONE_HOUR = 60*60*1000;

console.log('# crawler process', process.pid);

process.on('message', function(message){
    var initialUrls = new Set(message.urls);
    var originalWords = new Set(message.words);

    crawl(initialUrls, originalWords);
});

process.on('uncaughtException', function(e){
    console.error('# uncaughtException crawler', process.pid, Date.now() % ONE_HOUR, e, e.stack);
    process.exit();
});

process.on('SIGINT', function(){
    console.log('SIGINT', process.pid);
    process.exit();
});
