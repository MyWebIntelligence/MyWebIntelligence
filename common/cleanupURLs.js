"use strict";

var stripURLHash = require('./stripURLHash');
var url = require('url');


// These links usually end up being resources that are heavy to download and that we cannot process yet.
// They will be ignored

var EXCLUDED_FILE_EXTENSIONS = [
    // documents
    '.pdf',
    '.doc',
    '.docx',
    '.ppt',
    '.pptx',
    '.xls',
    '.xlsx',
    
    // archives
    '.zip',
    '.tar.gz',
    '.tar',
    '.gz',
    '.rar',
    
    // images
    '.png',
    '.eps',
    '.jpg',
    '.jpeg'
];



/*
    urls is an Array<string>
    these strings can be any string, but want to be urls
*/
module.exports = function(urls){

    return urls 
        .map(function(u){ return u.trim(); })
        .filter(function(u){
            var parsed = url.parse(u);
    
            // keep only absolute URLs
            if(!parsed.protocol || !parsed.hostname)
                return false;
                    
            // remove non-http links, like javascript: and mailto: links
            return /^https?/.test(parsed.protocol);
        })
        .map(stripURLHash)
        // exclude URLs that are likely to end up being resources that we cannot process
        .filter(function(u){
            // the url doesn't end with any of the excluded file extensions
            // equivalent to: none of the extension terminates the url
            return EXCLUDED_FILE_EXTENSIONS.every(function(ext){
                return !u.endsWith(ext);
            });
        });
    
};
