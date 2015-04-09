"use strict";

var request = require('request');

var makeSearchString = require('../common/makeSearchString');

var GCSE_BASE_URL = "https://www.googleapis.com/customsearch/v1?";

var MAX_GCSE_NUM = 10;
var STARTS = [1, 11, 21/*, 31, 41, 51, 61, 71, 81, 91*/];

module.exports = function prepareGCSEOracle(credentials){
    var apiKey = credentials["API key"];
    var cx = credentials["cx"];

    function makeGCSESearchURL(query, start, num){
        start = typeof start === "number" ? start : 1;
        num = typeof num === "number" ? num : MAX_GCSE_NUM;

        var params = {
            key: apiKey,
            cx: cx,
            q: query,
            start: start,
            num: num
        };

        return GCSE_BASE_URL + makeSearchString(params);
    }


    return function GCSEOracle(q/*, oracleOptions*/){
        
        var resultPs = STARTS.map(function(start){
            return new Promise(function(resolve, reject){
                var url = makeGCSESearchURL(q, start);
                request(url, function(error, response, body){
                    if(error){
                        reject(error);
                        return;
                    }

                    var bodyObj = JSON.parse(body)
                    var linksArray = bodyObj.items.map(function(item){
                        return item.link;
                    });
                    
                    if (response.statusCode < 400) {
                        resolve(new Set(linksArray));
                    }
                    else{
                        reject(new Error('HTTP status '+response.statusCode));
                    }

                });
            });
        });
        
        return Promise.all(resultPs).then(function(results){
            var ret = new Set();
            
            // results is a string[][]. flatten it
            results.forEach(function(r){
                r.forEach(function(url){
                    ret.add(url);
                });
            });
            
            return ret;
        });
    };

};
