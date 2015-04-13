"use strict";

/*

The approve function decides whether a page is worth keeping.
Roughly, criterias are :
* the page has the words to match in its coreContent/<title>/<h1>
* the page isn't too far away from the oracle results (quantified by depth)
* the page belongs to an expression domain that has been cited by enough expressions from other expression domains (this should retrigger a revalidation of other pages in the same expression domain)

TODO instead of "citedBy", consider computing a PageRank the the "graph so far"

interface ApproveOptions{
    wordsToMatch: Set<String>
    expression: Expression
    depth: number
    citedBy: Set<URL>
}

*/
    

// var EVAPORATION_FACTOR = 0.5;
// var approvalProbability = 1;

var MAXIMUM_DEPTH = 2;

module.exports = function approve(options){
    var depth = options.depth;
    var wordsToMatch = options.wordsToMatch;
    var mainText = options.expression.mainText;
    
    // oracle
    if(depth === 0)
        return true;
    
    if(depth >= MAXIMUM_DEPTH)
        return false;
    
    
    var allWordOccurences = 0;
    wordsToMatch.forEach(function(word){
        allWordOccurences += (mainText.match(new RegExp(word, "gi")) || []).length;
    });
    
    if(allWordOccurences >= wordsToMatch.size)
        return true;
    
    return false;
};
