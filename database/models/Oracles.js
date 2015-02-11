"use strict";

var Promise = require('es6-promise').Promise;

var makeJSONDatabaseModel = require('../makeJSONDatabaseModel');
var makePromiseQueuer = require('../makePromiseQueue')();

module.exports = makeJSONDatabaseModel('Oracles', {
    // return in array
    getAll: function getAll(){
        return this._getStorageFile().then(function(all){
            return Object.keys(all).map(function(k){ return all[k]});
        })
    },
    findById: function(OracleId){
        return this._getStorageFile().then(function(all){
            return all[OracleId];
        });
    },
    findByOracleNodeModuleName: function findByOracleNodeModuleName(oracleNodeModuleName){
        return this.getAll().then(function(all){
            return all.find(function(o){
                return o.oracleNodeModuleName === oracleNodeModuleName;
            });
        });
    },
    create: makePromiseQueuer(function create(oracleData){        
        var self = this;
        var id = this._nextId();

        return this._getStorageFile().then(function(all){
            var newOracle = Object.assign({id: id}, oracleData);

            all[id] = newOracle;

            return self._save(all).then(function(){
                return newOracle;
            });
        });
    }),
    update: makePromiseQueuer(function(Oracle){ // Oracle can be a delta-Oracle
        var self = this;
        var id = Oracle.id;

        return this._getStorageFile().then(function(all){
            var updatedOracle = Object.assign({}, all[id], Oracle);

            all[id] = updatedOracle;
            return self._save(all).then(function(){
                return updatedOracle;
            });;
        });
    }),
    delete: makePromiseQueuer(function(OracleId){
        var self = this;

        return this._getStorageFile().then(function(all){            
            delete all[OracleId];
            return self._save(all);
        });
    }),
    deleteAll: function(){
        var self = this;

        return this._save({});
    }
});