"use strict";

var db = require('../../../database');
var crawl = require('../../../crawl');
var persistCrawlResult = require('../../../crawl/persistCrawlResult');

module.exports = function(roots){
    return crawl(roots)
        .then(persistCrawlResult)
        .then(function(){
            return db.complexQueries.getGraphFromRootURIs(new Set(roots));
        });
};

