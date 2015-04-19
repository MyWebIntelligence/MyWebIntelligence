"use strict";

require('./ES-mess/index.js');

var Expressions = require('./postgresDB/index');

var createdP = Expressions.create({
    uri: "http://a.b/c",
    //fullHTML: html,
    main_html: "<span>a</span>",
    main_text: "a",
    title: "title",
    references: [
        "http://a.b/d"
    ],
    aliases: [
        "http://a.b/e"
    ],
    "meta_description": "description"
}).then(function(){
    console.log('success')
}).catch(function(err){
    console.error('creating failed', err);
});

createdP.then(function(){
    Expressions.findByURIAndAliases(new Set([
        "http://a.b/c"
    ])).then(function(result){
        console.log('success 1', result);
    }).catch(function(err){
        console.error('findByURIAndAliases failed', err);
    });
});
createdP.then(function(){
    Expressions.findByURIAndAliases(new Set([
        "http://a.b/e"
    ])).then(function(result){
        console.log('success 2', result);
    }).catch(function(err){
        console.error('findByURIAndAliases failed', err);
    });
});

var updatedP = createdP.then(function(){
    return Expressions.update({
        id: 1,
        meta_description: "updated description"
    }).then(function(result){
        console.log('success 3', result);
    }).catch(function(err){
        console.error('update error', err);
    });
});

updatedP.then(function(){
    return Expressions.findByCanonicalURI("http://a.b/c")
        .then(function(result){
            console.log('success 4', result);
        })
        .catch(function(err){
            console.error('findByCanonicalURI error', err);
        });
});
