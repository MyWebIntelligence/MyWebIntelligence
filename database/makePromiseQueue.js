"use strict";

var Promise = require('es6-promise').Promise;

module.exports = function makePromiseQueue(){
    
    var lastOperationFinishedP = Promise.resolve();

    return function makeQueueingOperation(f){

        return function(){
            var args = arguments;
            var self = this;
            
            lastOperationFinishedP = lastOperationFinishedP.then(function(){
                return f.apply(self, args);
            });
            
            return lastOperationFinishedP;
        };
        
    };

};