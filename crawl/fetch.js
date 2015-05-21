"use strict";

var http = require('http');

var request = require('request');

var MAXIMUM_IN_PROGRESS_BY_HOSTNAME = 20;
http.globalAgent.maxSockets = MAXIMUM_IN_PROGRESS_BY_HOSTNAME;

/*
    This module exports a function which fetches the content of a URL.
    

*/
module.exports = function(url){
    console.log('Fetch', url);
    
    return new Promise(function(resolve, reject){

        request.get({
            url: url,
            headers: {
                // Firefox Accept header
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "User-Agent": "My Web Intelligence crawler"
            },
            gzip: true
        }, function(error, response, httpBody){

            if(error)
                reject(error);
            else{
                resolve({
                    resource: {
                        url: response.request.uri.href, // url after redirects if any
                        http_status: response.statusCode,
                        content_type: response.headers["content-type"]
                    },
                    expression: {
                        html: httpBody
                    }
                });
            }
        });
    })
    
};
