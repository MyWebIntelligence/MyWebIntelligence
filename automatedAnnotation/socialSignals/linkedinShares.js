"use strict";

var request = require('request');

var BASE_LINKEDIN_SHARES_URL = "http://www.linkedin.com/countserv/count/share?format=json&url="


module.exports = function(url){
    return new Promise(function(resolve, reject){
        
        request({
            method: 'GET',
            url: BASE_LINKEDIN_SHARES_URL + encodeURIComponent(url)
        }, function(err, response, body){            
            if(err)
                reject(err);
            else{
                if(response.statusCode >= 400){
                    reject('LinkedIn share status code error '+response.statusCode);
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
