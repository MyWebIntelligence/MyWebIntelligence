'use strict';

// TODO get rid of this module when https://bugzilla.mozilla.org/show_bug.cgi?id=935223 is RESOLVED FIXED
module.exports = function makeSearchString(obj) {
    // http://stackoverflow.com/a/3608791
    var sp = Object.keys(obj).map(function(k){
        return obj[k] === undefined || obj[k] === null || Number.isNaN(obj[k]) ? 
            undefined :
            encodeURI(k) + '=' + encodeURI(obj[k]);
    });
    
    return sp
        .filter(function(x){ return x !== undefined; })
        .join('&');
};
