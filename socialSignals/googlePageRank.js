"use strict";

var pagerank = require('google-pagerank');

module.exports = function(url){
    return new Promise(function(resolve, reject){
        pagerank(url, function(err, rank) {
            if(err)
                reject(err)
            else
                resolve(Number.isNaN(rank) ? undefined : rank);
        });
    })
};
