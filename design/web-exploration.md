# Web exploration

MyWebIntelligence crawls the web to give access to a map of the web on a gven them

## Initial setup

The web is a graph. We begin the exploration of a *territoire* with some nodes provided by an *oracle*.
An *oracle* returns a set of urls given some keywords.

This gives us a set of initial nodes.

When an oracle result comes back, store them in database with the date the oracle was questioned. At this point, it should become impossble to edit the related query (chosen keywords, oracle, oracle-specific search options).

## From the initial nodes to a graph

All initial nodes are "approved". For each node, we do as follow:
* Extract the relevant content.
    * We use the [Readability API](https://www.readability.com/developers/api/parser) or the [npm module](https://www.npmjs.com/package/node-readability-edge).
* From this content, find urls in links (a[href])
* Get all of the pages at the end of these links
    * run the "approval" algorithm to decide whether the node is kept or not
* Stop when there is nothing to explore










