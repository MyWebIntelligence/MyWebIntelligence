"use strict";

var database = require('../database');
var crawl = require('../crawl')



/*
    urls: Set<url>
*/
module.exports = function startCrawl(urls){
    console.log('start crawl', urls.size);
    return Promise.all([
        database.GetExpressionTasks.createTasksTodo(urls),
        crawl()
    ]);
    
};
