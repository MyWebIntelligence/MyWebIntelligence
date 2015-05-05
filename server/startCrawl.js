"use strict";

var database = require('../database');
var crawl = require('../crawl')

/*
    urls: Set<url>
*/
module.exports = function startCrawl(urls, territoireId){
    if(!territoireId)
        throw new TypeError('missing territoireId');
    
    console.log('start crawl', territoireId, urls.size);
    return Promise.all([
        database.GetExpressionTasks.createTasksTodo(urls, territoireId),
        crawl()
    ]);
    
};
