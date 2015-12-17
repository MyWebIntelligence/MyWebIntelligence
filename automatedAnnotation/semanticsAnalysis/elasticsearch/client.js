"use strict";

var elasticsearch = require('elasticsearch');

var MAX_RETRIES = 10;

module.exports = function connect(host) {
    var client = new elasticsearch.Client({
        host: host,
        log: 'error',
        apiVersion : "1.7",
        requestTimeout : 60*1000
    });
    
    return new Promise(function (resolve, reject) {
        var tries = 0;
        
        (function tryConnect() {
            tries++;
            client.ping({
                requestTimeout: 10000
            }, function (err) {
                if (err) {
                    if(tries >= MAX_RETRIES){
                        reject(err);
                    }
                    else{
                        console.log(err);
                        setTimeout(tryConnect, 5000);
                    }
                } else {
                    resolve(client);
                }
            });
        })();
    });
}
