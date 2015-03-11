"use strict";

var Promise = require('es6-promise').Promise;
var promisify = require('es6-promisify');

var fs = require('fs');
var path = require('path');

var readFile = promisify(fs.readFile);
var writeFile = promisify(fs.writeFile);

console.log("process.env.NODE_ENV", process.env.NODE_ENV);

var BASE_STORAGE_PATH_P = new Promise(function(resolve){
    if(process.env.NODE_ENV === 'test')
        // doesn't work inside a docker container
        /*tmpdir(function(err, d){
            if(err) reject(err); else resolve(d);
        });*/
        resolve('/tmp');
    else
        resolve(path.resolve(__dirname, '_storage'))
})


BASE_STORAGE_PATH_P.then(function(p){
    console.log('BASE_STORAGE_PATH', p);
});

module.exports = function makeJSONDatabaseModel(name, methods){
    // to queue all I/O operations
    var lastOperationFinishedP = Promise.resolve();
    
    var storageControl = {
        // Purposefully don't cache the file value
        _getStorageFile: function(){
            lastOperationFinishedP = lastOperationFinishedP.then(function(){
                return BASE_STORAGE_PATH_P
                    .then(function(BASE_STORAGE_PATH){
                        return readFile(path.resolve(BASE_STORAGE_PATH, name+'.json'), {encoding: 'utf8'})
                    })
                    .then(function(res){
                        return JSON.parse(res);
                    })
                    .catch(function(err){
                        if(err){
                            // no file. Return empty "table". File will be created by next _save call
                            if(err.code === "ENOENT") return {}; else throw err;
                        }
                    });
            });
            
            return lastOperationFinishedP;
        },
        _save: function(data){
            lastOperationFinishedP = lastOperationFinishedP.then(function(){
                return BASE_STORAGE_PATH_P
                    .then(function(BASE_STORAGE_PATH){
                        return writeFile(path.resolve(BASE_STORAGE_PATH, name+'.json'), JSON.stringify(data, null, 3));
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
};
