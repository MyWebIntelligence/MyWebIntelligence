"use strict";

var request = require('request');

var makeSearchString = require('../common/makeSearchString');
var makeDocument = require('../common/makeDocument');

var readabilityParserKey;
try{
    readabilityParserKey = require('./config.json')["Readability-parser-API-key"];
}
catch(e){
    console.warn('Problem loading Readability Parser API key.', e);
    console.warn('If you want, create a Readability account https://www.readability.com/developers/api/parser and provide the key. See crawl/config.sample.json.')
    console.warn('Continuing without support for the Readability API');
}

console.log('readabilityParserKey', readabilityParserKey);


var READABILITY_PARSER_BASE_URL = "https://readability.com/api/content/v1/parser";

var ONE_HOUR = 60*60*1000; // ms
var last429;

/*
interface Expression{
    fullHTML: html,
    mainHTML: mainContent.outerHTML,
    mainText: mainContent.textContent,
    title: document.title,
    links: uniqueLinks,
    "meta-description": metaDesc && metaDesc.getAttribute('content')
}
*/

module.exports = function getReadabilityAPIMainContent(url){
    
    if(!readabilityParserKey)
        return Promise.reject(new Error('No Readability Parser API credentials'));
    
    if(last429 && Date.now() < last429 + 2*ONE_HOUR)
        return Promise.reject(new Error('Readability Parser API quota exceeded'));
    
    
    var readabilityParserAPIUrl = READABILITY_PARSER_BASE_URL + '?' + makeSearchString({
        token: readabilityParserKey,
        url: url
    });
    
    
    return new Promise(function(resolve, reject){
        request({
            url: readabilityParserAPIUrl,
            headers: {
                "Accept": "application/json"
            }
        }, function(error, response, body){            
            if(error)
                reject(error);
            else{
                if(response.statusCode >= 400){
                    if(response.statusCode === 429){ // quota exceeded
                        last429 = Date.now();
                    }
                    
                    reject(Object.assign(
                        new Error('Readability Parser API HTTP error'), 
                        {statusCode: response.statusCode}
                    ));
                }
                else{
                    var responseObj = JSON.parse(body);
                    
                    resolve(makeDocument(responseObj.content, url)
                        .then(function(o){
                            return {
                                mainContent: o.document.body,
                                dispose: o.dispose
                            }
                        })
                    );
                }
            }
        });
    });
};
