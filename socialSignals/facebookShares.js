"use strict";

var request = require('request');

var BASE_FACEBOOK_SHARES_URL = "http://graph.facebook.com/?id="

module.exports = function(url){
    return new Promise(function(resolve, reject){
        
        request({
            method: 'GET',
            url: BASE_FACEBOOK_SHARES_URL + encodeURIComponent(url)
        }, function(err, response, body){            
            if(err)
                reject(err);
            else{
                if(response.statusCode >= 400){
                    reject('Facebook share status code error '+response.statusCode);
                    return;
                }
                
                try{
                    var obj = JSON.parse(body);
                }
                catch(e){ reject(e); return; }
                
                if(!('shares' in obj)){
                    reject(new Error('Misformed Facebook share result'))
                    return;
                }
                
                resolve(obj.shares);
            }
        })
    
    })
    
};
