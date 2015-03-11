"use strict";

var makeJSONDatabaseModel = require('../makeJSONDatabaseModel');
var makePromiseQueuer = require('../makePromiseQueue')();

module.exports = makeJSONDatabaseModel('References', {
    // return in array
    getAll: function(){
        return this._getStorageFile().then(function(all){
            return Object.keys(all).map(function(k){ return all[k]});
        });
    },
    findById: function(referenceId){
        return this._getStorageFile().then(function(all){
            return all[referenceId];
        });
    },
    /* sourceUris is a Set */
    findBySourceURIs: function(sourceUris){
        return this.getAll().then(function(all){
            return all.filter(function(reference){
                return sourceUris.has(reference.source);
            });
        });
    },
    create: makePromiseQueuer(function(referenceData){
        var self = this;
        var id = this._nextId();
        
        return self._getStorageFile().then(function(all){
            var newreference = Object.assign({id: id}, referenceData);

            all[id] = newreference;
            return self._save(all).then(function(){
                return newreference;
            });
        });
    }),
    createByBatch: makePromiseQueuer(function(referencesData){
        var self = this;
        
        return self._getStorageFile().then(function(all){
            var newReferences = referencesData.map(function(rd){
                var id = self._nextId();
                
                var newreference = Object.assign({id: id}, rd);
                all[id] = newreference;
                return newreference;
            });
            
            return self._save(all).then(function(){
                return newReferences;
            });
        });
    }),
    update: makePromiseQueuer(function(reference){ // reference can be a delta-reference
        var self = this;
        var id = reference.id;

        return self._getStorageFile().then(function(all){
            var updatedreference = Object.assign({}, all[id], reference);

            all[id] = updatedreference;
            return self._save(all).then(function(){
                return updatedreference;
            });
        });
    }),
    delete: makePromiseQueuer(function(referenceId){
        var self = this;

        return self._getStorageFile().then(function(all){            
            delete all[referenceId];
            return self._save(all);
        });
    }),
    deleteAll: function(){
        return this._save({});
    }
});
