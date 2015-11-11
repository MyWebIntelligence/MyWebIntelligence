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
    
    keywords = keywords
        .split(',')
        .map(function(s){
            return s.trim()
        })
        .filter(function(s){
            return s.length >= 1;
        })
        .map(function(s){
            return s.slice(s.indexOf('"')+1, s.lastIndexOf('"'));
        });
    
    ed.keywords = keywords;
    return ed;
}
