"use strict";

/*
    default options for the 'request' HTTP module
*/

module.exports = Object.freeze({
    strictSSL: false,
    gzip: true,
    headers: {
        // Firefox Accept header
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent": "My Web Intelligence crawler https://github.com/MyWebIntelligence/MyWebIntelligence"
    }
})
