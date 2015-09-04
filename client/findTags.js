"use strict";

module.exports = function findTags(str){
    var tags = str.split(/[\;\,\/]/);
    var leftover = tags.pop(); // mutates tags
    
    tags = tags.filter(function(t){ return t.length >= 1; })
    
    if(leftover.match(/\S/))
        leftover = leftover.replace(/^\s+/, '');
    
    return {
        leftover: leftover,
        tags: new Set(tags.map(function(s){ return s.trim(); }))
    }
};
