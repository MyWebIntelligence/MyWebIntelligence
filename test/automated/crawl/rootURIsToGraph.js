"use strict";

var db = require('../../../database');
var crawl = require('../../../crawl');
var persistCrawlResult = require('../../../crawl/persistCrawlResult');

module.exports = function(roots, words){
    return crawl(roots, words)
        .then(persistCrawlResult)
        .then(function(){
            return db.complexQueries.getGraphFromRootURIs(new Set(roots));
        });
};

