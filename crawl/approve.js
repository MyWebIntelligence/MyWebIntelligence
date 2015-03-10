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
    fullPage: string // full HTML page
    coreHTML: string // html, but reduced
    coreTextContent: string // human text included in coreHTML
    depth: number
    citedBy: Set<URL>
}

*/

module.exports = function approve(options){
    var depth = options.depth;
    var wordsToMatch = options.wordsToMatch;
    var coreContent = options.coreContent;
    
    if(depth === 0)
        return true;
    
    if(depth === 1)
        return false;
    
    
    var allWordOccurences = 0;
    wordsToMatch.forEach(function(word){
        allWordOccurences += (coreContent.match(new RegExp(word, "g")) || []).length;
    });
    var averageOccurencesPerWord = allWordOccurences/wordsToMatch.size;
    
    if(averageOccurencesPerWord > depth)
        return true;
    
    
    
    return false;
};
