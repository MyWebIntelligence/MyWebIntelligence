"use strict";

var request = require('request');


/*
    This file is built upon standard oembed. The spec can be found at http://oembed.com
    
    @provider is an object as they are available in providers.json
*/
module.exports = function(oembedEndpointUrl){
    
    return function(url){
        return new Promise(function(resolve, reject){
            var oembedUrl = [
                oembedEndpointUrl,
                '?',
                'url=',
                encodeURIComponent(url),
                '&',
                'format=json'
            ].join('');
            
            
            request({
                url: oembedUrl,
                headers: {
                    Accept: 'application/json'
                }
            }, function(error, response, body){
                if(error){
                    reject(error);
                    return;
                }

                if(response.status >= 400){
                    reject(Object.assign(
                        new Error('Oembed HTTP status error'),
                        {
                            httpStatus: response.status,
                            body: body
                        }
                    ));
                }
                else{
                    try{
                        resolve(JSON.parse(body))
                    }
                    catch(e){
                        reject(Object.assign(
                            new Error('Oembed JSON parsing error'),
                            e
                        ));
                    }
                }

            })

        })
    };
    
}
