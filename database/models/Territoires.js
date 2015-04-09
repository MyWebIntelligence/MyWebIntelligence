"use strict";

var Queries = require('./Queries');

var makeJSONDatabaseModel = require('../makeJSONDatabaseModel');
var makePromiseQueuer = require('../makePromiseQueue')();


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
    create: makePromiseQueuer(function(territoireData){
        var self = this;
        var id = this._nextId();
        
        return this._getStorageFile().then(function(all){
            var newTerritoire = Object.assign({}, territoireData, {id: id});

            all[id] = newTerritoire;
            return self._save(all).then(function(){
                return newTerritoire;
            });
        });
    }),
    update: makePromiseQueuer(function(Territoire){ // Territoire can be a delta-Territoire 
        var self = this;
        var id = Territoire.id;

        return this._getStorageFile().then(function(all){
            var updatedTerritoire = Object.assign({}, all[id], Territoire);

            all[id] = updatedTerritoire;
            return self._save(all).then(function(){
                return updatedTerritoire;
            });
        });
    }),
    delete: makePromiseQueuer(function(territoireId){
        var self = this;

        var relatedQueriesDeletedP = Queries.findByBelongsTo(territoireId).then(function(queries){
            //console.log('found', queries.length, "relevant queries");
            
            return Promise.all(queries.map(function(q){ return Queries.delete(q.id); }));
        });
        
        return relatedQueriesDeletedP.then(function(){
            return self._getStorageFile().then(function(all){
                delete all[territoireId];
                return self._save(all);
            });
        }); 
    }),
    deleteAll: function(){
        var self = this;

        return this.getAll().then(function(all){
            return Promise.all(all.map(function(t){
                return self.delete(t.id);
            }))
        })
    }
});
