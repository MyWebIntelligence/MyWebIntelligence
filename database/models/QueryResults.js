"use strict";

var makeJSONDatabaseModel = require('../makeJSONDatabaseModel');
var makePromiseQueuer = require('../makePromiseQueue')();

module.exports = makeJSONDatabaseModel('QueryResults', {
    // return in array
    getAll: function(){
        return this._getStorageFile().then(function(all){
            return Object.keys(all).map(function(k){ return all[k]});
        });
    },
    findById: function(QueryResultId){
        return this._getStorageFile().then(function(all){
            return all[QueryResultId];
        });
    },
    findLatestByQueryId: function(queryId){
        return this.getAll().then(function(arr){
            console.log('findLatestByQueryId', queryId, arr.length, arr.filter(function(queryResult){
                return queryResult.query_id === queryId;
            }).length);
            
            return arr.filter(function(queryResult){
                return queryResult.query_id === queryId;
            }).reduce(function(latest, res){
                return Date.parse(latest.created_at) > Date.parse(res.created_at) ?
                    latest :
                    res;
            });
        });
    },
    create: makePromiseQueuer(function(QueryResultData){
        var self = this;
        var id = this._nextId();

        return this._getStorageFile().then(function(all){
            var newQueryResult = Object.assign({id: id}, QueryResultData);

            all[id] = newQueryResult;
            return self._save(all).then(function(){
                return newQueryResult;
            });
        });
    }),
    update: makePromiseQueuer(function(QueryResult){ // QueryResult can be a delta-QueryResult
        var self = this;
        var id = QueryResult.id;

        return this._getStorageFile().then(function(all){
            var updatedQueryResult = Object.assign({}, all[id], QueryResult);

            all[id] = updatedQueryResult;
            return self._save(all).then(function(){
                return updatedQueryResult;
            });
        });
    }),
    delete: makePromiseQueuer(function(QueryResultId){
        var self = this;

        return this._getStorageFile().then(function(all){            
            delete all[QueryResultId];
            return self._save(all);
        });
    }),
    deleteAll: function(){
        return this._save({});
    }
});
