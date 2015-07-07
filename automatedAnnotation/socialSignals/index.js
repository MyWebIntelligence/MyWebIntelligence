"use strict";

var immutableMap = require('immutable').Map;

/*
    keys of this object are to be kept in sync with annotation_types SQL type
*/
module.exports = immutableMap({
    'facebook_like': require('./facebookLikes'),
    'facebook_share': require('./facebookShares'),
    'twitter_share': require('./twitterShares'),
    'google_pagerank': require('./googlePageRank'),
    'linkedin_share': require('./linkedinShares')
});
