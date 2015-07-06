"use strict";

var request = require('request');

var BASE_TWITTER_SHARES_URL = "https://cdn.api.twitter.com/1/urls/count.json?url="

module.exports = function(url){
    return new Promise(function(resolve, reject){
        
        request({
            method: 'GET',
            url: BASE_TWITTER_SHARES_URL + encodeURIComponent(url)
        }, function(err, response, body){            
            if(err)
                reject(err);
            else{
                if(response.statusCode >= 400){
                    reject('Twitter share status code error '+response.statusCode);
                    return;
                }
                
                try{
                    var shares = JSON.parse(body).count;
                }
                catch(e){ reject(e); return; }
                
                resolve(shares);
            }
        })
    
    })
    
};
