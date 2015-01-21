"use strict";

var Promise = require('es6-promise').Promise;

var makeJSONDatabaseModel = require('../makeJSONDatabaseModel');

module.exports = makeJSONDatabaseModel('Queries', {
    // return in array
    getAll: function(){
        return this._getStorageFile().then(function(all){
            return Object.keys(all).map(function(k){ return all[k]});
        });
    },
    findById: function(QueryId){
        return this._getStorageFile().then(function(all){
            return all[QueryId];
        });
    },
    findByBelongsTo: function(territoireId){
        return this.getAll().then(function(arr){
            return arr.filter(function(query){
                return query.belongs_to === territoireId;
            });
        });
    },
    create: function(QueryData){
        var self = this;
        var id = this._nextId();

        return this._getStorageFile().then(function(all){
            var newQuery = Object.assign({id: id}, QueryData);

            all[id] = newQuery;
            return self._save(all).then(function(){
                return newQuery;
            });
        });
    },
    update: function(Query){ // Query can be a delta-Query
        var self = this;
        var id = Query.id;

        return this._getStorageFile().then(function(all){
            var updatedQuery = Object.assign({}, all[id], Query);

            all[id] = updatedQuery;
            return self._save(all).then(function(){
                return updatedQuery;
            });;
        });
    },
    delete: function(QueryId){
        var self = this;

        return this._getStorageFile().then(function(all){            
            delete all[QueryId];
            return self._save(all);
        });
    }
});