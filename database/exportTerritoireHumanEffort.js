"use strict";

var moment = require('moment');

var Territoires = require('./models/Territoires');
var Queries = require('./models/Queries');
var Oracles = require('./models/Oracles');
var Resources = require('./models/Resources');
var ResourceAnnotations = require('./models/ResourceAnnotations');
var ExpressionDomainAnnotations = require('./models/ExpressionDomainAnnotations');
var ExpressionDomains = require('./models/ExpressionDomains');

module.exports = function(territoireId){
    var territoireP = Territoires.findById(territoireId);
    var queriesP = Queries.findByTerritoireId(territoireId);
    var oraclesP = Oracles.getAll();
    var resourceAnnotationsP = ResourceAnnotations.findByTerritoireId(territoireId);
    var resourcesP = resourceAnnotationsP.then(function(resourceAnnotations){
        var ids = new Set( resourceAnnotations.map(function(rAnn){ return rAnn.resource_id; }) );
        return Resources.findValidByIds(ids);
    });
    var expressionDomainsAnnotationsP = ExpressionDomainAnnotations.findByTerritoireId(territoireId);
    var expressionDomainsP = expressionDomainsAnnotationsP.then(function(edAnns){
        var ids = new Set( edAnns.map(function(edAnn){ return edAnn.expression_domain_id; }) );
        return ExpressionDomains.findByExpressionDomainIds(ids);
    });

    return Promise.all([
        territoireP, queriesP, oraclesP, resourceAnnotationsP, resourcesP, expressionDomainsAnnotationsP, expressionDomainsP
    ])
    .then(function(res){
        var territoire = res[0];
        var queries = res[1];
        var oracles = res[2];
        var resourceAnnotations = res[3];
        var resources = res[4];
        var expressionDomainsAnnotations = res[5];
        var expressionDomains = res[6];

        return {
            version: 1,
            name: territoire.name,
            description: territoire.description,
            queries: queries.map(function(query){
                var oracle = oracles.find(function(o){
                    return o.id === query.oracle_id;
                });

                return {
                    name: query.name,
                    q: query.q,
                    oracle_options: query.oracle_options,
                    oracle_node_module_name: oracle.oracle_node_module_name
                }
            }),
            resources: resources
                .map(function(r){
                    var rid = r.id;

                    var annotations = resourceAnnotations.find(function(rAnn){ return rAnn.resource_id === rid; })
                    var humanAnnotations = {
                        approved: annotations.approved,
                        sentiment: annotations.sentiment || undefined,
                        favorite: annotations.favorite || undefined,
                        tags: annotations.tags,
                        publication_date: annotations.publication_date ?
                            moment(annotations.publication_date).format('YYYY-MM-DD') : 
                            undefined
                    };

                    if(Object.keys(humanAnnotations).every(function(k){
                        var v = humanAnnotations[k];
                        return v === undefined || v === null;
                    })){
                        return undefined;
                    }
                    else{
                        return {
                            url: r.url,
                            annotations: humanAnnotations
                        }
                    }
                })
                .filter(function(r){ return !!r }),
            expressionDomains: expressionDomains
                .map(function(ed){
                    var edid = ed.id;

                    var annotations = expressionDomainsAnnotations.find(function(edAnn){
                        return edAnn.expression_domain_id === edid;
                    })
                    var humanAnnotations = {
                        media_type: annotations.media_type,
                        emitter_type: annotations.emitter_type
                    };

                    if(Object.keys(humanAnnotations).every(function(k){
                        var v = humanAnnotations[k];
                        return v === undefined || v === null;
                    })){
                        return undefined;
                    }
                    else{
                        return {
                            name: ed.name,
                            annotations: humanAnnotations
                        }
                    }
                })
                .filter(function(r){ return !!r })
        }

    })

}
