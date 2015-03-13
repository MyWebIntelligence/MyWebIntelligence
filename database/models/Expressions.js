"use strict";

var makeJSONDatabaseModel = require('../makeJSONDatabaseModel');
var makePromiseQueuer = require('../makePromiseQueue')();

module.exports = makeJSONDatabaseModel('Expressions', {
    // return in array
    getAll: function(){
        return this._getStorageFile().then(function(all){
            return Object.keys(all).map(function(k){ return all[k]});
        });
    },
    findById: function(expressionId){
        return this._getStorageFile().then(function(all){
            return all[expressionId];
        });
    },
    /* uris is a Set */
    findByURIAndAliases: function(uris){
        return this.getAll().then(function(all){
            return all.filter(function(expression){
                return uris.has(expression.uri) || (expression.aliases || []).some(function(alias){
                    uris.has(alias);
                });
            })
        });
    },
    findByCanonicalURI: function(uri){
        return this.getAll().then(function(all){
            return all.find(function(expression){
                return uri === expression.uri;
            });
        });
    },
    create: makePromiseQueuer(function(expressionData){
        var self = this;
        var id = self._nextId();
        
        return self._getStorageFile().then(function(all){
            var newexpression = Object.assign({id: id}, expressionData);

            all[id] = newexpression;
            return self._save(all).then(function(){
                return newexpression;
            });
        });
    }),
    createByBatch: makePromiseQueuer(function(expressionsData){
        var self = this;
        
        return self._getStorageFile().then(function(all){
            var newExpression = expressionsData.map(function(ed){
                var id = self._nextId();
                
                var newexpression = Object.assign({id: id}, ed);
                all[id] = newexpression;
                return newexpression
            });
            
            return self._save(all).then(function(){
                return newExpression;
            });
        });
    }),
    update: makePromiseQueuer(function(expression){ // expression can be a delta-expression
        var self = this;
        var id = expression.id;

        return self._getStorageFile().then(function(all){
            var updatedexpression = Object.assign({}, all[id], expression);

            all[id] = updatedexpression;
            return self._save(all).then(function(){
                return updatedexpression;
            });
        });
    }),
    delete: makePromiseQueuer(function(expressionId){
        var self = this;

        return self._getStorageFile().then(function(all){            
            delete all[expressionId];
            return self._save(all);
        });
    }),
    deleteAll: function(){
        return this._save({});
    }
});
