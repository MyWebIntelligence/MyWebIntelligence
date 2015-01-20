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
        var id = this._nextId();

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
            var updatedXXXX = Object.assign({}, all[id], XXXX);

            all[id] = updatedXXXX;
            return self._save(all).then(function(){
                return updatedXXXX;
            });;
        });
    },
    delete: function(XXXXId){
        var self = this;

        return this._getStorageFile().then(function(all){            
            delete all[XXXXId];
            return self._save(all);
        });
    }
});