"use strict";

require('../ES-mess');

var crawl = require('./core-crawl');

process.title = "MyWI crawler";

process.on('message', function(message){
    var initialUrls = new Set(message.urls);
    var originalWords = new Set(message.words);

    crawl(initialUrls, originalWords);
});
