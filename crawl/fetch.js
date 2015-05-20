"use strict";

var http = require('http');

var request = require('request');

var MAXIMUM_IN_PROGRESS_BY_HOSTNAME = 20;
http.globalAgent.maxSockets = MAXIMUM_IN_PROGRESS_BY_HOSTNAME;

/*
    This module exports a function which fetches the content of a URL.
    This module takes care of per-domain throttling
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
                if(response.statusCode >= 400)
                    reject(Object.assign(
                        new Error('Fetch HTTP error'),
                        {status: response.statusCode, url: url}
                    ));
                else{
                    if(!/html/.test(response.headers["content-type"])){
                        reject(Object.assign(
                            new Error('Fetch HTTP problem (content type)'),
                            {
                                status: response.statusCode, 
                                "content-type": response.headers["content-type"], 
                                url: url
                            }
                        ));
                    }
                    else{
                        resolve({
                            html: httpBody,
                            originalURL: url,
                            // TODO the canonical URL should also take link@rel=canonical into account
                            canonicalURL : response.request.uri.href 
                        });
                    }
                }
            }
        });
    })
    
};
