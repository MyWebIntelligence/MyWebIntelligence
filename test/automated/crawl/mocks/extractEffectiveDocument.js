"use strict";

module.exports = function(url){
    
    return Promise.resolve({
        html: '',
        title: '',
        "date_published": '',
        links: new Set()
    });
}