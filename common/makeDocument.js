"use strict";

var jsdom = require('jsdom');


module.exports = function makeDocument(htmlFragment, baseURL){
    return new Promise(function(resolve, reject){
        jsdom.env({
            html: htmlFragment,
            url: baseURL,
            done: function(err, window){
                if(err) reject(err);
                else resolve({
                    dispose: function(){
                        // to free memory, jsdom requires window.close to be called.
                        // otherwise, massive leaks ensue, eventually leading to process crash
                        window.close();
                    },
                    document: window.document
                });
            }
        });
    });
};
