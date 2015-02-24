"use strict";

var db = require('../database');

module.exports = function(crawlResult){
    /*{
        nodes: results,
        redirects: redirects
    }*/
    var expressions = [];
    var references = [];
    var aliases = [];

    crawlResult.nodes.forEach(function(node, url){
        expressions.push({
            uri: url,
            html: node.html,
            title: node.title,
            date_published: node.date_published,
            creation_date: new Date()
        });

        node.links.forEach(function(linkTarget){
            references.push({
                source: url,
                target: linkTarget,
                creation_date: new Date()
            });
        });
    });

    crawlResult.redirects.forEach(function(target, source){
        aliases.push({
            target: target,
            source: source,
            type: 'redirect',
            creation_date: new Date()
        });
    });

    console.log('expressions, references, aliases', expressions.length, references.length, aliases.length);

    return Promise.all([
        db.Expressions.createByBatch(expressions),
        db.References.createByBatch(references),
        db.Aliases.createByBatch(aliases)
    ]);
}