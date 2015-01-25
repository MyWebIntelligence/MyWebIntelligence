"use strict";

var Promise = require('es6-promise').Promise;

var makeJSONDatabaseModel = require('../makeJSONDatabaseModel');
var makePromiseQueuer = require('../makePromiseQueue')();

module.exports = makeJSONDatabaseModel('OracleCredentials', {
    // return in array
    getAll: function(){
        return this._getStorageFile().then(function(all){
            return Object.keys(all).map(function(k){ return all[k]});
        });
    },
    findByUserAndOracleId: function(userId, oracleId){
        return this.getAll().then(function(all){
            return all.find(function(oc){
                return oc.userId === userId && oc.oracleId === oracleId;
            });
        });
    },
    findByUserId: function(userId){
        return this.getAll().then(function(all){
            return all.filter(function(oc){
                return oc.userId === userId;
            });
        });
    },
    create: makePromiseQueuer(function(OracleCredentialsData){
        var self = this;
        var id = this._nextId();

        return this._getStorageFile().then(function(all){
            var newOracleCredentials = Object.assign({id: id}, OracleCredentialsData);

            all[id] = newOracleCredentials;
            return self._save(all).then(function(){
                return newOracleCredentials;
            });
        });
    }),
    update: makePromiseQueuer(function(OracleCredentials){ // OracleCredentials can be a delta-OracleCredentials
        var self = this;
        var id = OracleCredentials.id;

        return this._getStorageFile().then(function(all){
            var updatedOracleCredentials = Object.assign({}, all[id], OracleCredentials);

            all[id] = updatedOracleCredentials;
            return self._save(all).then(function(){
                return updatedOracleCredentials;
            });
        });
    }),
    createOrUpdate: function(oracleCredentialsData){
        var self = this;
        
        return this.findByUserAndOracleId(oracleCredentialsData.userId, oracleCredentialsData.oracleId).then(function(o){
            return o ?
                self.update(Object.assign(o, oracleCredentialsData)) : 
                self.create(oracleCredentialsData) ;
        });
        
    },
    delete: makePromiseQueuer(function(OracleCredentialsId){
        var self = this;

        return this._getStorageFile().then(function(all){            
            delete all[OracleCredentialsId];
            return self._save(all);
        });
    })
});