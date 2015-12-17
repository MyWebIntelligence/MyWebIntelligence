"use strict";

module.exports = function serializeObjectKeysForDB(keys){
    return keys.map(function(k){ return '"'+k+'"'; }).join(', ');
};
