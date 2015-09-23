"use strict";

var database = require('../database');
var getExpressionDomain = require('../expressionDomain/index.js');


module.exports = function findOrCreateExpressionDomain(url){
    
    return getExpressionDomain(url)
        .then(function(expressionDomainString){
            
            return database.ExpressionDomains.findByString(expressionDomainString)
                .then(function(expressionDomain){
                    return expressionDomain ? expressionDomain :
                        database.ExpressionDomains.create({
                            string: expressionDomainString,
                            main_url: 'http://'+expressionDomainString+'/'
                        })
                        .then(function(created){
                            return created[0];
                        })
                        .catch(function(err){
                            console.log('findOrCreateExpressionDomain catch', err); 
                            // race condition may have led an expression domain being created
                            // between the first findByString and the create resulting in a violation
                            // of the unique string constraint (leading to this catch)
                            return database.ExpressionDomains.findByString(expressionDomainString)
                        })
                });
        })
};
