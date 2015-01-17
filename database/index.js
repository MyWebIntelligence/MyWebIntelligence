"use strict";

if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

var Promise = require('es6-promise').Promise;


var fs = require('fs');
var path = require('path');


var nextId = (function(){
    // hopefully helps against collisions for long enough
    var nextId = Math.round(Math.random() * Math.pow(2, 30));
    
    return function(){
        return nextId++;
    }
})();

function dbObjToString(){ return this.id; };

module.exports = {
    Users: {
        /* return in array form */
        getAll: function(){
            return this._getStorageFile().then(function(all){
                return Object.keys(all).map(function(k){ return all[k]});
            });
        },
        findById: function(userId){
            return this._getStorageFile().then(function(all){
                return all[userId];
            });
        },
        findByGoogleId: function(googleId){
            var self = this;
            
            return this.getAll().then(function(arr){
                return arr.find(function(user){
                    return user.google_id === googleId;
                });
            });
        },
        create: function(userData){
            var self = this;
            var id = nextId();
            
            return this._getStorageFile().then(function(all){
                var newUser = Object.assign({toString: dbObjToString}, userData, {id: id});
                
                all[id] = newUser;
                return self._save(all).then(function(){
                    return newUser;
                });
            });
        },
        update: function(user){ /* user can be a delta-user */
            var self = this;
            var id = user.id;
            
            return this._getStorageFile().then(function(all){
                var updatedUser = Object.assign({}, all[id], user, {id: id});
                
                all[id] = updatedUser;
                return self._save(all);
            });
        },
        delete: function(user){ // can be a user or a userId
            var self = this;
            
            return this._getStorageFile().then(function(all){
                delete all[user];
                return self._save(all);
            });
        },
        _getStorageFile: function(){
            return new Promise(function(resolve, reject){
                fs.readFile(path.resolve(__dirname, '_storage', 'Users.json'), {encoding: 'utf8'}, function(err, res){
                    
                    if(err){
                        console.log('err code', err.code);
                        if(err.code === "ENOENT"){
                            resolve({});
                        } 
                        else{
                            console.log('_getStorageFile', err);
                            reject(err);
                        }
                    } 
                    else resolve(JSON.parse(res));
                });
            });
        },
        _save: function(data){
            return new Promise(function(resolve, reject){
                fs.writeFile(path.resolve(__dirname, '_storage', 'Users.json'), JSON.stringify(data), function(err, res){
                    if(err) reject(err); else resolve(res);
                });
            });
        }
    }
}