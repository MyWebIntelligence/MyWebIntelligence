"use strict";

var makeJSONDatabaseModel = require('../makeJSONDatabaseModel');
var makePromiseQueuer = require('../makePromiseQueue')();

module.exports = makeJSONDatabaseModel('Aliases', {
    // return in array
    getAll: function(){
        return this._getStorageFile().then(function(all){
            return Object.keys(all).map(function(k){ return all[k]});
        });
    },
    findById: function(aliasId){
        return this._getStorageFile().then(function(all){
            return all[aliasId];
        });
    },
    /* sourceUris is a Set */
    findBySourceURIs: function(sourceUris){
        return this.getAll().then(function(all){
            return all.filter(function(alias){
                return sourceUris.has(alias.source);
            });
        });
    },
    create: makePromiseQueuer(function(aliasData){
        var self = this;
        var id = this._nextId();
        
        return self._getStorageFile().then(function(all){
            var newalias = Object.assign({id: id}, aliasData);

            all[id] = newalias;
            return self._save(all).then(function(){
                return newalias;
            });
        });
    }),
    createByBatch: makePromiseQueuer(function(aliasesData){
        var self = this;
        
        return self._getStorageFile().then(function(all){
            var newAliases = aliasesData.map(function(rd){
                var id = self._nextId();
                
                var newalias = Object.assign({id: id}, rd);
                all[id] = newalias;
                return newalias;
            });
            
            return self._save(all).then(function(){
                return newAliases;
            });
        });
    }),
    update: makePromiseQueuer(function(alias){ // alias can be a delta-alias
        var self = this;
        var id = alias.id;

        return self._getStorageFile().then(function(all){
            var updatedalias = Object.assign({}, all[id], alias);

            all[id] = updatedalias;
            return self._save(all).then(function(){
                return updatedalias;
            });
        });
    }),
    delete: makePromiseQueuer(function(aliasId){
        var self = this;

        return self._getStorageFile().then(function(all){            
            delete all[aliasId];
            return self._save(all);
        });
    }),
    deleteAll: function(){
        return this._save({});
    }
});
