"use strict";

require('../../ES-mess')

var fbShare = require('../../crawl/automatedAnnotation/socialSignals/facebookShares');
var fbLikes = require('../../crawl/automatedAnnotation/socialSignals/facebookLikes');
var twShares = require('../../crawl/automatedAnnotation/socialSignals/twitterShares');
var lkShares = require('../../crawl/automatedAnnotation/socialSignals/linkedinShares');

var U = 'https://www.youtube.com/watch?v=KWZGAExj-es';


fbShare(U)
    .then(function(res){ console.log('Facebook shares', U, res); })
    .catch(function(e){ console.log('Facebook shares err', e, e.stack); });

fbLikes(U)
    .then(function(res){ console.log('Facebook likes', U, res); })
    .catch(function(e){ console.log('Facebook likes err', e, e.stack); });

twShares(U)
    .then(function(res){ console.log('Twitter shares', U, res); })
    .catch(function(e){ console.log('Twitter shares err', e, e.stack); });

pr(U)
    .then(function(res){ console.log('Google PageRank', U, res); })
    .catch(function(e){ console.log('Google PageRank err', e, e.stack); });

lkShares(U)
    .then(function(res){ console.log('LinkedIn shares', U, res); })
    .catch(function(e){ console.log('LinkedIn shares err', e, e.stack); });


