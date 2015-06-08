"use strict";

var database = require('../database');
var crawl = require('../crawl')

/*
    resourceIds: Set<ResourceId>
*/
module.exports = function startCrawl(resourceIds, territoireId){
    if(!territoireId)
        throw new TypeError('missing territoireId');
    
    console.log('start crawl', territoireId, resourceIds.size);
    return Promise.all([
        database.GetExpressionTasks.createTasksTodo(resourceIds, territoireId, 0),
        crawl()
    ]);
    
};
