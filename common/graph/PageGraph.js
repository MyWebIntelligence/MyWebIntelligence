"use strict";

var GraphModel = require('./GraphModel');

var pageNodeDesc = {
    // Node attributes description
    /*"domain": {
        type: "string"
    },*/
    "url": {
        type: "string"
    },
    "title": {
        type: "string"
    },/*
    "publication_date": {
        type: "string"
    },*/
    "content_length": {
        type: "integer"
    },
    "depth": {
        type: "integer"
    },
    "expressionId": {
        type: "integer"
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
