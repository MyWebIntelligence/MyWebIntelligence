"use strict";

module.exports = function massageExpressionDomain(ed){
    if(!ed) // undefined and null cases
        return ed;
    
    if(Array.isArray(ed.keywords))
        return ed;
    
    
    var keywords = ed.keywords || '';
    keywords = keywords
     .trim()
     .replace(/^\{/, '')
     .replace(/}$/g, '');
    
    keywords = keywords.split(',')
        .map(function(s){ return s.trim(); });
    
    ed.keywords = keywords;
    return ed;
}
