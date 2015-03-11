"use strict";

var request = require('request');

var makeSearchString = require('../common/makeSearchString');
var makeDocument = require('../common/makeDocument');
var stripURLHash = require('../common/stripURLHash');

var config = require('./config.json');

var readabilityParserKey = config["Readability-parser-API-key"];

var READABILITY_PARSER_BASE_URL = "https://readability.com/api/content/v1/parser";

/*
interface EffectiveDocument{
    html: string // stipped HTML containing only the useful content
    title: string // <title> or <h1>
    links: Set<string>,
    date_published: DateString
}
*/

module.exports = function(urlToExplore){
    
    var url = READABILITY_PARSER_BASE_URL + '?' + makeSearchString({
        token: readabilityParserKey,
        url: urlToExplore
    });
    
    //console.log('Readability parser API call', url);
    
    return new Promise(function(resolve, reject){
        request({
            url: url,
            headers: {
                "Accept": "application/json"
            }
        }, function(error, response, body){            
            if(error)
                reject(error);
            else{
                if(response.statusCode >= 400)
                    reject(new Error('Readability parser status code '+response.statusCode));
                else{
                    var responseObj = JSON.parse(body);
                    
                    resolve(makeDocument(responseObj.content, urlToExplore)
                        .then(function(doc){
                            var links = Array.from(doc.body.querySelectorAll('a[href]'));
                        
                            var urls = links
                                .map(function(a){ return a.href.trim() })
                                // remove non-http links, like javascript: and mailto: links
                                .filter(function(u){ return /^https?/.test(u); })
                                .map(stripURLHash)
                        
                            var uniqueLinks = new Set(urls);
                        
                            // remove self-references
                            uniqueLinks.delete(urlToExplore);
                        
                            // console.log('uniqueLinks', urlToExplore, uniqueLinks.size);
                        
                            return {
                                html: responseObj.content,
                                text: doc.body.textContent,
                                title: responseObj.title,
                                "date_published": responseObj.date_published,
                                links: uniqueLinks
                            };
                        })
                    );
                }
            }
        });
    });
};
