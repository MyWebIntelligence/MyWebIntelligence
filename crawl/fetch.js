"use strict";

var Promise = require('es6-promise').Promise;

var request = require('request');

/*
    // Content type filtering
    if (!/html/.test(response.headers["content-type"])) {
      error = new Error('Invalid content-type');
      errInfo.contentType = response.headers["content-type"];
    }
*/

/*
    This module exports a function which fetches the content of a URL.
    This module takes care of per-domain throttling
*/
module.exports = function(url){
    // console.log('fetching', url);
    
    return new Promise(function(resolve, reject){
        request({
            url: url,
            headers: {
                // Firefox Accept header
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "User-Agent": "My Web Intelligence crawler"
            }
        }, function(error, response, body){
            if(error)
                reject(error);
            else{
                if(response.statusCode >= 400)
                    reject(new Error('Fetch status code '+response.statusCode));
                else
                    resolve({
                        html: body,
                        originalURL: url,
                        URLAfterRedirects : response.request.uri.href
                    });
            }
        })
    });
};