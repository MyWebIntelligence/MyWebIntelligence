"use strict";

var Set = require('es6-set');
var Promise = require('es6-promise').Promise;

var db = require('../database');
var interogateOracle = require('./interogateOracle');
var crawl = require('../crawl');


module.exports = function onQueryCreated(query, user){
    // console.log("onQueryCreated", query.name, user.name);
    
    return db.Oracles.findById(query.oracle_id)
        .then(function(oracle){
            if(oracle.needsCredentials){
                return db.OracleCredentials.findByUserAndOracleId(user.id, oracle.id).then(function(creds){
                    return interogateOracle(oracle, query.q, query.searchOptions, creds);
                })
            }
            else{
                return interogateOracle(oracle, query.q, query.searchOptions);    
            }
        })
        .then(function(queryResults){
            db.QueryResults.create({
                query_id: query.id,
                results: queryResults._toArray(),
                created_at: new Date()
            });
            // don't wait for the results to be stored in database to start crawling
            return crawl(queryResults, new Set(query.q.split(" ")));
        })
        .then(function(crawlResult){
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
        })
        .catch(function(err){
            console.error('onQueryCreated error', err);
        });
}