"use strict";

var serializeObjectValues = require('./serializeObjectValues');
var serializeObjectKeysForDB = require('./serializeObjectKeysForDB');

module.exports = function serializeObjectForDB(data){
    var keys = Object.keys(data);
    
    return {
        serializedKeys: serializeObjectKeysForDB(keys),
        serializedValues: serializeObjectValues(data, keys)
    };
};
