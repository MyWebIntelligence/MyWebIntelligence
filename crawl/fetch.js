"use strict";

var request = require('request');
var parseURL = require('url').parse;


var MAXIMUM_IN_PROGRESS_BY_HOSTNAME = 20;

var inFlightByHostname = new Map/*<hostname, Set<url>>*/();
var pendingByHostname = new Map/*<hostname, Set<url>>*/()

var resolveRejectPromiseByUrl = new Map/*<url, {resolve, reject, promise}>*/()

function sendTheHTTPRequest(url){
    var hostname = parseURL(url).hostname;
    
    request({
        url: url,
        headers: {
            // Firefox Accept header
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "User-Agent": "My Web Intelligence crawler"
        }
    }, function(error, response, httpBody){
        // response came back, so not in flight anymore
        inFlightByHostname.get(hostname).delete(url);
        if(inFlightByHostname.get(hostname).size === 0) // all request for this domain have returned
            inFlightByHostname.delete(hostname);

        // pendingByHostname book-keeping
        var pending = pendingByHostname.get(hostname);
        if(pending && pending.size >= 1){
            var urlToDo = pending._pick();
            sendTheHTTPRequest(urlToDo);
            if(pending.size === 0)
                pendingByHostname.delete(hostname);
        }
        
        // Looking forward to destructuring
        var o = resolveRejectPromiseByUrl.get(url);
        //console.log('resolveRejectPromiseByUrl', url, o ? 'o' : o);
        
        resolveRejectPromiseByUrl.delete(url);
        var resolve = o.resolve;
        var reject = o.reject;

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

    // inFlightByHostname book-keeping
    if(!inFlightByHostname.has(hostname))
        inFlightByHostname.set(hostname, new Set());

    inFlightByHostname.get(hostname).add(url);
}

/*
    This module exports a function which fetches the content of a URL.
    This module takes care of per-domain throttling
*/
module.exports = function(url){
    //console.log('fetching', url);
    
    // Request already in flight, just return the existing promise. No need to create a new one or else.
    if(resolveRejectPromiseByUrl.has(url))
        return resolveRejectPromiseByUrl.get(url).promise;
    
    
    // extract domain
    var hostname = parseURL(url).hostname;
    
    if(!inFlightByHostname.has(hostname))
        inFlightByHostname.set(hostname, new Set());
    
    var inFlight = inFlightByHostname.get(hostname);
    
    // if already max in progress, add to a pending list
    if(inFlight.size === MAXIMUM_IN_PROGRESS_BY_HOSTNAME){
        if(!pendingByHostname.has(hostname))
            pendingByHostname.set(hostname, new Set());
        
        var pending = pendingByHostname.get(hostname);
        pending.add(url);
    }
    else
        sendTheHTTPRequest(url);
    
    
    // create a promise to be returned right now, but save resolve/reject for later
    var resolve, reject;
    var promise = new Promise(function(_resolve, _reject){
        resolve = _resolve;
        reject = _reject;
    });
    
    resolveRejectPromiseByUrl.set(url, {
        resolve: resolve,
        reject: reject,
        promise: promise
    });

    return promise;
};
