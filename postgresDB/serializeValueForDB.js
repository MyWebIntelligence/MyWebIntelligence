"use strict";

var serializeArrayForDB = require('./serializeArrayForDB');

module.exports = function serializeValueForDB(v){    
    if(Array.isArray(v))
        return "'"+ serializeArrayForDB(v) +"'";
    
    if(typeof v === 'string')
        return "'"+ v.replace(/\'/g, "''") +"'";

    if(Object.prototype.toString.call(v) === '[object Set]')
        return serializeValueForDB(v.toJSON());
        
    return String(v);
};
