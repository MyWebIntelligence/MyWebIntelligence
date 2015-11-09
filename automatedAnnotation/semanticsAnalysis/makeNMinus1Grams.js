"use strict";

/* 
    Find "Ville de" and "de Bordeaux" in "Ville de Bordeaux"

*/
module.exports = function makeNMinus1Grams(ngram){
    var split = ngram.split(' ');
    
    if(split.length === 1) // simple word
        return [];
    
    return [
        split.slice(0, split.length -1).join(' '),
        split.slice(1, split.length).join(' ')
    ];
}
