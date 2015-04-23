"use strict";

//var serializeValueForDB = require('./serializeValueForDB');

module.exports = function serializeArrayForDB(arr){
    return '{'+arr.map(function(v){
        if(Array.isArray(v))
            return "'"+ serializeArrayForDB(v) +"'";
        else
            return typeof v === 'string' ?
                '"'+ v +'"' :
                String(v);
    })+'}'
};
