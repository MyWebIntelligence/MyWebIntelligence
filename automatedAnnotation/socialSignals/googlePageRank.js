"use strict";

var pagerank = require('google-pagerank');

// a value to signify that there is no pagerank
var NO_PAGERANK = 12;

module.exports = function(url){
    return new Promise(function(resolve, reject){
        pagerank(url, function(err, rank) {
            if(err)
                reject(err)
            else
                resolve(Number.isNaN(rank) ? NO_PAGERANK : rank);
        });
    })
};
