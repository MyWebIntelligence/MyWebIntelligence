"use strict";

var Set = require('es6-set');

var crawl = require('../../crawl');

var URLs = new Set([
    'http://en.wikipedia.org/wiki/List_of_HTTP_status_codes',
    'https://t.co/MVaH9yUPSy',
    'https://linkurio.us/graph-viz-101/',
    'http://thinkaurelius.github.io/titan/',
    'http://en.wikipedia.org/wiki/Graph_%28abstract_data_type%29'
]);

var keywords = new Set(['graph']);

crawl(URLs, keywords)
    .then(function(result){
        console.log('crawl result', result);
    })
    .catch(function(err){
        console.error('crawl error', err);
    });