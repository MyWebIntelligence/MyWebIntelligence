"use strict";

var Promise = require('es6-promise').Promise;
var jsdom = require('jsdom');


module.exports = function makeDocument(htmlFragment, baseURL){
    return new Promise(function(resolve, reject){
        jsdom.env({
            html: htmlFragment,
            url: baseURL,
            done: function(err, window){
                if(err) reject(err);
                else resolve(window.document);
            }
        });
    });
};
