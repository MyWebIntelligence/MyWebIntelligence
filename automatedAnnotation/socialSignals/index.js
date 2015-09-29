"use strict";

var immutableMap = require('immutable').Map;

var database = require('../../database');

/*
    keys of this object will be used as annotations_task.type
*/
var annotationFunctions = {
    'facebook_like': require('./facebookLikes'),
    'facebook_share': require('./facebookShares'),
    'twitter_share': require('./twitterShares'),
    'google_pagerank': require('./googlePageRank'),
    'linkedin_share': require('./linkedinShares')
};

var exports = immutableMap();

Object.keys(annotationFunctions).forEach(function(type){
    
    exports = exports.set(type, function(resource, territoireId){
        annotationFunctions[type](resource.url).then(function(value){
            var values = {};
            values[type] = value;

            return database.ResourceAnnotations.update(
                resource.id, 
                territoireId, 
                undefined, // annotationFunction did the annotation job, so that's not a human user, so undefined
                values, 
                undefined // no approved value
            );
        })
    });
    
})


module.exports = exports
