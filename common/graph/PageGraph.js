"use strict";

var GraphModel = require('./GraphModel');

var pageNodeDesc = {
    // Node attributes description
    "url": {
        type: "string"
    },
    "title": {
        type: "string"
    },
    "depth": {
        type: "integer"
    },
    "expressionId": {
        type: "string"
    },
    "publication_date": {
        type: "string"
    },
    'facebook_like': {
        type: "integer",
        default: -1
    },
    'facebook_share': {
        type: "integer",
        default: -1
    },
    'google_pagerank': {
        type: "integer",
        default: -1
    },
    'linkedin_share': {
        type: "integer",
        default: -1
    },
    'sentiment': {
        type: "string",
        default: ''
    },
    'tags': {
        type: "string",
        default: ''
    },
    'favorite': {
        type: "boolean",
        default: false
    },
    'media_type': {
        type: "string",
        default: ''
    },
    expression_domain_id: {
        type: "string",
        default: ''
    }
};

var pageEdgeDesc = {
    "weight": {
        type: "integer"
    }
};

module.exports = function PageGraph(){
    return new GraphModel(pageNodeDesc, pageEdgeDesc);
};
