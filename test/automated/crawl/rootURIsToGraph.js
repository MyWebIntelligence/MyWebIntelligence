"use strict";

var db = require('../../../database');
var crawl = require('../../../server/startCrawl');

module.exports = function(roots, words){
    return new Promise(function(resolve){
        crawl(roots, words);
        
        setTimeout(function(){
            resolve(db.complexQueries.getGraphFromRootURIs(new Set(roots)));
        }, 60*1000);
    });
};

