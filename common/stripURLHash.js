"use strict";

var url = require('url');

module.exports = function(u){
    var parsed = url.parse(u);
    
    parsed.hash = undefined;
    
    return url.format(parsed);
};