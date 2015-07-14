"use strict";

var GraphModel = require('./GraphModel');

var domainNodeDesc = {
    // Node attributes description
    "title": {
        type: "string"
    },
    /*"type": {
        type: "string" // enum. See https://github.com/MyWebIntelligence/MyWebIntelligence/issues/74#issuecomment-84032672
    },*/
    "nb_expressions": {
        type: "integer"
    },
    "base_url": {
        type: "string"
    },
    "depth": {
        type: "integer"
    },
    "global_alexarank": {
        type: "integer"
    },
    "inverse_global_alexarank": {
        type: "float"
    },
    "min_facebook_like": {
        type: "integer"
    }
};

var domainEdgeDesc = {
    "weight": {
        type: "integer"
    }
};

module.exports = function DomainGraph(){
    return new GraphModel(domainNodeDesc, domainEdgeDesc);
};
