"use strict";

var request = require('request');
var makeDocument = require('../../../../common/makeDocument');

module.exports = function(url){
    
    return new Promise(function(resolve, reject){
        request(url, function(err, response, body){
            if(err){
                reject(err);
                return;
            }
            
            makeDocument(body, url).then(function(doc){
                var links = doc.body.querySelectorAll('a[href]');

                var uniqueLinks = new Set(Array.prototype.map.call(links, function(a){
                    return a.href;
                }));

                // remove self-references
                uniqueLinks.delete(url);

                // console.log('uniqueLinks', urlToExplore, uniqueLinks.size);

                resolve({
                    html: doc.body.outerHTML,
                    title: doc.title,
                    "date_published": null,
                    links: uniqueLinks
                });
            })
            .catch(reject);
        })
    })
    
    
}