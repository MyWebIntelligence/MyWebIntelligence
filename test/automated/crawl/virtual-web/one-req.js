"use strict";

var request = require('request');

request('http://a.web/', function(error, response, body){
    if(error)
        throw error;
    else{
        console.log('one-req', response.statusCode, body.length);
    }
})