"use strict";

// The override mistake prevents Object.freezing Object.prototype
// https://mail.mozilla.org/pipermail/es-discuss/2015-February/041628.html
Object.seal(Object.prototype);

Object.freeze(Object);

[
    // ES5 types
    Function,
    Array,
    String,
    Number,
    Boolean,
    // ES6 types
    Set,
    Map,
    Promise,
    
    // object subtypes
    Date,
    // Error, // V8 adds proprietary bullshit used by depd https://github.com/dougwilson/nodejs-depd/blob/c06fb7d31d274706653d12e87258d4bc93dfe836/index.js#L371-L372
    RegExp,
    
    // utils
    Math,
    JSON
].forEach(function(o){
    Object.freeze(o);
    if(o.prototype)
        Object.freeze(o.prototype);
});