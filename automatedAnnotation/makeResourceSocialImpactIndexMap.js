"use strict";

var computeSocialImpact = require('./computeSocialImpact');


module.exports = function makeResourceSocialImpactIndexMap(resourceAnnotationsById){
    if(!resourceAnnotationsById)
        return undefined;
    
    var map = new Map();
    
    var absoluteValues = [];
    
    // Computing absolute values for everyone
    Object.keys(resourceAnnotationsById).forEach(function(id){
        var annotations = resourceAnnotationsById[id];
        
        var absoluteSocialImpact = computeSocialImpact(annotations);
        
        map.set(id, absoluteSocialImpact);
        
        absoluteValues.push(absoluteSocialImpact)
    });
    
    // Compute index
    var max = Math.max.apply(undefined, absoluteValues);
    var min = Math.min.apply(undefined, absoluteValues);
    
    console.log('makeResourceSocialImpactIndexMap', min, max, map.size)
    
    var delta = max - min;
    
    map.forEach(function(value, key){
        var index = Math.ceil( 100*(value - min)/delta );
        
        map.set(key, index);
    })
    
    return map;
}
