"use strict";

var Promise = require('es6-promise').Promise;
var Set = require('es6-set');

var request = require('request');

var makeSearchString = require('../common/makeSearchString');
var makeDocument = require('../common/makeDocument');

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
                            var links = doc.body.querySelectorAll('a[href]');
                        
                            var uniqueLinks = new Set(Array.prototype.map.call(links, function(a){
                                return a.href;
                            }));
                        
                            // remove self-references
                            uniqueLinks.delete(urlToExplore);
                        
                            // console.log('uniqueLinks', urlToExplore, uniqueLinks.size);
                        
                            return {
                                html: responseObj.content,
                                title: responseObj.title,
                                "date_published": responseObj.date_published,
                                links: uniqueLinks
                            };
                        })
                    );
                }
            };
        });
    });
};