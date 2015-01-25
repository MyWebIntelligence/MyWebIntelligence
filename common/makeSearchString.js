'use strict';

// TODO get rid of this module when https://bugzilla.mozilla.org/show_bug.cgi?id=935223 is RESOLVED FIXED
function makeSearchString(obj) {
    var sp = [];
    // http://stackoverflow.com/a/3608791
    Object.keys(obj).forEach(function (k) { return sp.push(encodeURI(k) + '=' + encodeURI(obj[k])); });
    return sp.join('&');
}

module.exports = makeSearchString;