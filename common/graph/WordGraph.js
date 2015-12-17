"use strict";

var GraphModel = require('./GraphModel');

var pageNodeDesc = {
    // Node attributes description
    "word": {
        type: "string"
    },
    "doc_count": {
        type: "integer"
    }
};

var pageEdgeDesc = {
    "weight": {
        type: "integer"
    }
};

module.exports = function PageGraph(){
    return new GraphModel(pageNodeDesc, pageEdgeDesc, {defaultedgetype: "undirected"});
};
