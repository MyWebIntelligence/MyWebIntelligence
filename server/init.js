"use strict";

var client = require('../automatedAnnotation/semanticsAnalysis/elasticsearch/client');
var es = require('../automatedAnnotation/semanticsAnalysis/elasticsearch');

var ELASTICSEARCH_ANALYSIS_HOST = "elasticanalysis:9200";

client(ELASTICSEARCH_ANALYSIS_HOST)
    .then(es)
    // at startup delete all previous indices so newer indices can be recreated with the new mappings
    .then(function(esapi){
        return esapi.deleteIndex('*')
        .then(function(){
            console.log('Deleted all indices');
            return esapi;
        })
    });
