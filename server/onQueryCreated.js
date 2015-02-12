"use strict";

var database = require('../database');
var crawl = require('../crawl')




module.exports = function onQueryCreated(query){
    console.log("onQueryCreated", query);
    
    /*
    database.QueryResults.create({
        query_id: newQuery.id,
        results: searchResults,
        created_at: new Date()
    });
    */
}