"use strict";

var GraphModel = require('./GraphModel');

var domainNodeDesc = {
    // Node attributes description
    "title": {
        type: "string"
    },
    "domain_title": {
        type: "string"
    },
    "domain_type": {
        type: "string"
    },
    "description": {
        type: "string"
    },
    "keywords": {
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
    
    "estimated_potential_audience": {
        type: "integer"
    },
    
    "min_facebook_like": {
        type: "integer"
    },
    "max_facebook_like": {
        type: "integer"
    },
    "median_facebook_like": {
        // if array has an even length, average of the two middle value is performed. Can end up with a x.5
        type: "float" 
    },
    
    "min_facebook_share": {
        type: "integer"
    },
    "max_facebook_share": {
        type: "integer"
    },
    "median_facebook_share": {
        // if array has an even length, average of the two middle value is performed. Can end up with a x.5
        type: "float"
    },
    
    "min_twitter_share": {
        type: "integer"
    },
    "max_twitter_share": {
        type: "integer"
    },
    "median_twitter_share": {
        // if array has an even length, average of the two middle value is performed. Can end up with a x.5
        type: "float"
    },
    
    "min_linkedin_share": {
        type: "integer"
    },
    "max_linkedin_share": {
        type: "integer"
    },
    "median_linkedin_share": {
        // if array has an even length, average of the two middle value is performed. Can end up with a x.5
        type: "float"
    },
    
    "min_google_pagerank": {
        type: "integer"
    },
    "max_google_pagerank": {
        type: "integer"
    },
    "median_google_pagerank": {
        // if array has an even length, average of the two middle value is performed. Can end up with a x.5
        type: "float"
    },
    "sum_likes": {
        type: "float"
    },
    "sum_shares": {
        type: "float"
    },
    "social_impact": {
        type: "float"
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
