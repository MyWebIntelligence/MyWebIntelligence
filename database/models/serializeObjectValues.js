"use strict";

var serializeValueForDB = require('./serializeValueForDB');

module.exports = function serializeObjectValues(obj, keys){
    return keys.map(function(k){
        var v = obj[k];
        return serializeValueForDB(v);
    });
};
