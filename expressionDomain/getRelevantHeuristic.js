"use strict";

var url = require('url');
var defaultHeuristic = require('./heuristics/default');

var facebookHeuristic = require('./heuristics/facebook');
var twitterHeuristic = require('./heuristics/twitter');
var linkedinHeuristic = require('./heuristics/linkedin');
var slideshareHeuristic = require('./heuristics/slideshare');
var youtubeHeuristic = require('./heuristics/youtube');
var vimeoHeuristic = require('./heuristics/vimeo');
var dailymotionHeuristic = require('./heuristics/dailymotion');
var instagramHeuristic = require('./heuristics/instagram');

var heuristics = [
    facebookHeuristic,
    twitterHeuristic,
    linkedinHeuristic,
    slideshareHeuristic,
    youtubeHeuristic,
    vimeoHeuristic,
    dailymotionHeuristic,
    instagramHeuristic
];

/*
    The expression domain is the domain of the party making the expression.
    Usually, it will be the URL host, but in some instances (Facebook, Youtube, Twitter, etc.), the domain does not refer to the person/organisation expressing themselves (Twitter does not express someone's tweets, etc.).
    
    This is also different from authorship. For a newspaper, the newspaper is of interest, not the specific journalist who wrote the article (mostly because the journalist is following an editorial lign they did not choose)
    
    This is unrelated to the notion of domain in the sense of URL domain (scheme + hostname + port)
    
*/
module.exports = function(u){
    var parsedURL = url.parse(u);
    var hostname = parsedURL.hostname;

    var correctHeuristic = heuristics.find(function(h){
        return h.hostnames.has(hostname);
    })
    
    return correctHeuristic ? correctHeuristic : defaultHeuristic;
};
