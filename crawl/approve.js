"use strict";

/*

The approve function decides whether a page is worth keeping.
Roughly, criterias are :
* the page has the words to match in its coreContent/<title>/<h1>
* the page isn't too far away from the oracle results (quantified by depth)
* the page belongs to an expression domain that has been cited by enough expressions from other expression domains (this should retrigger a revalidation of other pages in the same expression domain)

TODO instead of "citedBy", consider computing an hypothetical PageRank

interface ApproveOptions{
    wordsToMatch: Set<String>
    fullPage: string // full HTML page
    coreContent: string // html, but reduced
    depth: number
    citedBy: Set<URL>
}

*/

module.exports = function approve(options){
    return true;
}