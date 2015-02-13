"use strict";

var Promise = require('es6-promise').Promise;
var jsdom = require('jsdom');


module.exports = function makeDocument(htmlFragment){
    return new Promise(function(resolve, reject){
        jsdom.env(htmlFragment, function(err, window){
            if(err) reject(err);
            else resolve(window.document);
        });
    });
};
