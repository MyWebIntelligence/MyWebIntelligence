"use strict";

var Promise = require('es6-promise').Promise;

var makeJSONDatabaseModel = require('../makeJSONDatabaseModel');

throw 'Search/replace XXXX';

module.exports = makeJSONDatabaseModel('XXXX', {
    // return in array
    getAll: function(){
        return this._getStorageFile().then(function(all){
            return Object.keys(all).map(function(k){ return all[k]});
        });
    },
    findById: function(XXXXId){
        return this._getStorageFile().then(function(all){
            return all[XXXXId];
        });
    },
    create: function(XXXXData){
        var self = this;
        var id = this._nextId;

        return this._getStorageFile().then(function(all){
            var newXXXX = Object.assign({id: id}, XXXXData);

            all[id] = newXXXX;
            return self._save(all).then(function(){
                return newXXXX;
            });
        });
    },
    update: function(XXXX){ // XXXX can be a delta-XXXX
        var self = this;
        var id = XXXX.id;

        return this._getStorageFile().then(function(all){
            var updatedXXXX = Object.assign({}, all[id], XXXX, {id: id});

            all[id] = updatedXXXX;
            return self._save(all).then(function(){
                return updatedXXXX;
            });;
        });
    },
    delete: function(XXXX){ // can be a XXXX or a XXXXId
        var self = this;

        return this._getStorageFile().then(function(all){
            var id = Object(XXXX) === XXXX ? XXXX.id : id;
            
            delete all[id];
            return self._save(all);
        });
    }
});