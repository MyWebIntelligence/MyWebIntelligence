"use strict";

var Promise = require('es6-promise').Promise;

var makeJSONDatabaseModel = require('../makeJSONDatabaseModel');
var makePromiseQueuer = require('../makePromiseQueue')();


module.exports = makeJSONDatabaseModel('Users', {
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
    create: makePromiseQueuer(function(userData){
        var self = this;
        var id = this._nextId();

        return this._getStorageFile().then(function(all){
            var newUser = Object.assign({id: id}, userData);

            all[id] = newUser;
            return self._save(all).then(function(){
                return newUser;
            });
        });
    }),
    update: makePromiseQueuer(function(user){ // user can be a delta-user
        var self = this;
        var id = user.id;

        return this._getStorageFile().then(function(all){
            var updatedUser = Object.assign(all[id], user);

            all[id] = updatedUser;
            return self._save(all).then(function(){
                return updatedUser;
            });
        });
    }),
    delete: makePromiseQueuer(function(userId){
        var self = this;

        return this._getStorageFile().then(function(all){
            delete all[userId];
            return self._save(all);
        });
    })
});