"use strict";

var fork = require('child_process').fork;

var crawlerProcess = fork( require.resolve('../crawl') );

/*
    urls: Set<url>
    words: Set<string>
*/
module.exports = function startCrawl(urls, words){
    
    // sync communication, but in practice, it should be so rare that the runtime cost will be very small
    crawlerProcess.send({
        urls: urls.toJSON(),
        words: words.toJSON()
    });
    
};
