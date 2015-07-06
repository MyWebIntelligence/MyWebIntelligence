"use strict";

var request = require('request');

var BASE_FACEBOOK_LIKES_URL = "https://api.facebook.com/method/fql.query?format=json&query=select%20like_count%20from%20link_stat%20where%20url="

module.exports = function(url){
    return new Promise(function(resolve, reject){
        
        request({
            method: 'GET',
            url: BASE_FACEBOOK_LIKES_URL + encodeURIComponent("'"+url+"'")
        }, function(err, response, body){            
            if(err)
                reject(err);
            else{
                if(response.statusCode >= 400){
                    reject('Facebook like status code error '+response.statusCode);
                    return;
                }
                
                try{
                    var likes = JSON.parse(body)[0].like_count;
                }
                catch(e){ reject(e); return; }
                
                resolve(likes);
            }
        })
    
    })
    
};
