"use strict";

var Promise = require('es6-promise').Promise;

var makeJSONDatabaseModel = require('../makeJSONDatabaseModel');


module.exports = makeJSONDatabaseModel('Territoires', {
    // return in array form
    getAll: function(){
        return this._getStorageFile().then(function(all){
            return Object.keys(all).map(function(k){ return all[k]});
        });
    },
    findById: function(territoireId){
        return this._getStorageFile().then(function(all){
            return all[territoireId];
        });
    },
    findByCreatedBy: function(userId){
        return this.getAll().then(function(arr){
            return arr.filter(function(territoire){
                return territoire.created_by === userId;
            });
        });
    },
    create: function(territoireData){
        var self = this;
        var id = this._nextId;

        return this._getStorageFile().then(function(all){
            var newTerritoire = Object.assign({}, territoireData, {id: id});

            all[id] = newTerritoire;
            return self._save(all).then(function(){
                return newTerritoire;
            });
        });
    },
    update: function(Territoire){ // Territoire can be a delta-Territoire 
        var self = this;
        var id = Territoire.id;

        return this._getStorageFile().then(function(all){
            var updatedTerritoire = Object.assign({}, all[id], Territoire, {id: id});

            all[id] = updatedTerritoire;
            return self._save(all).then(function(){
                return updatedTerritoire;
            });
        });
    },
    delete: function(territoire){ // can be a Territoire or a TerritoireId
        var self = this;

        return this._getStorageFile().then(function(all){
            var id = Object(territoire) === territoire ? territoire.id : id;
            
            delete all[id];
            return self._save(all);
        });
    }
});