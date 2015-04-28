"use strict";

var request = require('request');
var moment = require('moment');

var makeSearchString = require('../common/makeSearchString');

var GCSE_BASE_URL = "https://www.googleapis.com/customsearch/v1?";

var MAX_GCSE_NUM = 10;
var STARTS = [1/*, 11, 21, 31, 41, 51, 61, 71, 81, 91*/];

function makeArray(length, val){
    // should be array#fill
    var a = Array(length);
    for(var i = 0; i < length; i++){
        a[i] = val;
    }
    return a;
}

// duration in days
function makeRangesFromNow(duration, number){
    var now = moment();
    
    return makeArray(number).map(function(e, i){
        return {
            start: now.clone().subtract((i+1)*duration, 'days'),
            end: now.clone().subtract(i*duration, 'days')
        };
    });
}


module.exports = function prepareGCSEOracle(credentials){
    var apiKey = credentials["API key"];
    var cx = credentials["cx"];

    function makeGCSESearchURL(options){
        options = Object.assign(
            {}, 
            {
                start: 1,
                num: MAX_GCSE_NUM,
                dateRange: undefined
            },
            options
        );
        
        var query = options.query;
        var start = options.start;
        var num = options.num;
        var dateRange = options.dateRange;

        var params = {
            key: apiKey,
            cx: cx,
            q: query,
            start: start,
            num: num,
            // https://developers.google.com/custom-search/docs/structured_data#page_dates
            sort: dateRange ? [ 
                'date', 
                'r', 
                moment(dateRange.start).format("YYYYMMDD"), 
                moment(dateRange.end).format("YYYYMMDD")
            ].join(':') : undefined
        };

        return GCSE_BASE_URL + makeSearchString(params);
    }
    
    function getGCSEResultsForAllStarts(options){
        var results = new Set();
        
        return Promise.all(STARTS.map(function(start){
            var url = makeGCSESearchURL(Object.assign(
                {
                    start: start,
                    num: MAX_GCSE_NUM
                },
                options
            ));
            
            return getGCSEResults(url)
                .then(function(res){ res.forEach(function(r){ results.add(r); }); });
        })).then(function(){
            return results;
        })
    }

    function getGCSEResults(url){
        console.log('getting gcse fur url', url);
        return new Promise(function(resolve, reject){
            request(url, function(error, response, body){
                if(error){
                    reject(error);
                    return;
                }

                if (response.statusCode < 400) {
                    var bodyObj = JSON.parse(body);

                    // when there are no result, apparently, there is no .items
                    if(!Array.isArray(bodyObj.items))
                        bodyObj.items = [];

                    var linksArray = bodyObj.items.map(function(item){
                        return item.link;
                    });
                    resolve(new Set(linksArray));
                }
                else{
                    console.error('GCSE HTTP status err', url, response.statusCode, body);
                    reject(Object.assign(new Error('HTTP status error'), {
                        status: response.statusCode,
                        url: url
                    }));
                }

            });
        });
    }

    return function GCSEOracle(q, oracleOptions){
        var regularGCSEResults = getGCSEResultsForAllStarts({
            query: q
        });
        
        if(oracleOptions && oracleOptions.add24MonthHistory){
            // 8*3 month === 24 month
            var rangeResults = makeRangesFromNow(90, 3).map(function(range){
                return getGCSEResultsForAllStarts({
                    query: q,
                    dateRange: range
                });
            });
            
            var allResults = rangeResults.concat(regularGCSEResults);
            
            return Promise.all(allResults).then(function(allResultSets){
                var res = new Set();
                
                allResultSets.forEach(function(resultSet){
                    resultSet.forEach(function(url){ res.add(url); })
                });
                
                return res;
            });
        }
        else{
            return regularGCSEResults;
        }
    };

};
