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
