"use strict";

var Promise = require('es6-promise').Promise;

var fs = require('fs');
var path = require('path');

module.exports = function makeJSONDatabaseModel(name, methods){
    // to queue all I/O operations
    var lastOperationFinishedP = Promise.resolve();
    
    var storageControl = {
        // Purposefully don't cache the file value
        _getStorageFile: function(){
            lastOperationFinishedP = lastOperationFinishedP.then(function(){
                return new Promise(function(resolve, reject){
                    fs.readFile(path.resolve(__dirname, '_storage', name+'.json'), {encoding: 'utf8'}, function(err, res){
                        if(err){
                            // no file. Return empty "table". File will be created by next _save call
                            if(err.code === "ENOENT") resolve({}); else reject(err);
                        } 
                        else resolve(JSON.parse(res));
                    });
                });
            });
            
            return lastOperationFinishedP;
        },
        _save: function(data){
            lastOperationFinishedP = lastOperationFinishedP.then(function(){
                return new Promise(function(resolve, reject){
                    fs.writeFile(path.resolve(__dirname, '_storage', name+'.json'), JSON.stringify(data, null, 3), function(err, res){
                        if(err) reject(err); else resolve(res);
                    });
                });
            });
            
            return lastOperationFinishedP;
        },
        // hopefully helps against collisions for long enough
        _nextId: function(){
            return Math.round(Math.random() * Math.pow(2, 30));
        }
    };
    
    return Object.assign({}, storageControl, methods);
}