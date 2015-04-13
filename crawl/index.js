"use strict";

require('../ES-mess');
process.title = "MyWI crawler";

var crawl = require('./core-crawl');


process.on('message', function(message){
    var initialUrls = new Set(message.urls);
    var originalWords = new Set(message.words);

    crawl(initialUrls, originalWords);
});
