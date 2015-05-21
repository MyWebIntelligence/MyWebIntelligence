"use strict";

var fetch = require('./fetch');
var makeResourceInfo = require('./makeResourceInfo');

var isValidResource = require('./isValidResource');

/*
interface FetchedDocument{
    resource: {
        url: string, // url after redirects if any
        http_status: number,
        content_type: string,
        other_error: string
    },
    expression: {
        html: string
    }
}

interface ResourceInfo {
    expression: {
        //fullHTML: html,
        main_html: string,
        main_text: string,
        title: string,
        "meta_description": string
    },
    links: Set<url>
};

*/
/*
    Fetch the URL (to get redirects and the body)
    Extract core content (from readability or otherwise).
*/
module.exports = function getExpression(url){
    // check if it's already in the database
    return fetch(url)
        .then(function(fetchResult){
            if(isValidResource(fetchResult.resource)){
                return makeResourceInfo(fetchResult.resource.url, fetchResult.expression.html).then(function(resourceInfos){
                    // expression from resourceInfos overrides the one from fetchResult
                    return Object.assign({}, fetchResult, resourceInfos);
                });
            }
            else{
                return fetchResult;
            }
        });
};
