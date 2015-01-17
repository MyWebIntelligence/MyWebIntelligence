"use strict";

var Promise = require('es6-promise').Promise;

var fs = require('fs');
var path = require('path');

module.exports = function makeJSONDatabaseModel(name, methods){
    
    // hopefully helps against collisions for long enough
    var nextId = Math.round(Math.random() * Math.pow(2, 30));
    
    var storageControl = {
        // Purposefully don't cache the file value
        _getStorageFile: function(){
            return new Promise(function(resolve, reject){
                fs.readFile(path.resolve(__dirname, '_storage', name+'.json'), {encoding: 'utf8'}, function(err, res){
                    if(err){
                        if(err.code === "ENOENT") resolve({}); else reject(err);
                    } 
                    else resolve(JSON.parse(res));
                });
            });
        },
        _save: function(data){
            return new Promise(function(resolve, reject){
                fs.writeFile(path.resolve(__dirname, '_storage', name+'.json'), JSON.stringify(data), function(err, res){
                    if(err) reject(err); else resolve(res);
                });
            });
        },
        get _nextId(){ return nextId++; }
    };
    
    return Object.assign({}, storageControl, methods);
}