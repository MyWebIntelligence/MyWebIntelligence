# Tests TODO

## Client

Everything to be done with Casper

## Common

* Add tests for graph
    * a couple for building graphs, a couple for GEXFExport
* makeDocument
    * including rough test that dispose does free some memory
    * Maybe move that to its own module
* makeSearchString
* stripURLHash

## Crawl

* approve
    * make sure it returns true for depth === 0
    * not sure for other things. It will change a lot over time
* fetch
    * make sure calling the 20 requests window is respected
    * make sure all requests are eventually sent
* getExpression
    * make sure fetch is called when there is no coresponding exprssion in db
    * retrieves the expression in db if it exists
        * make sure that works for aliases
* getReadabilityAPIMainContent
    * make sure it rejects if there is no credentials
    * make sure request isn't called for some time after a 429
* makeExpression
    * plenty of things to test
* index.js
    * tested indirectly via `npm run test-crawl`. Unit testing would be debattable
    * make sure the crawler saves pages progressively and not only at the end
    * in `npm run test-crawl`, mock `getReadabilityAPIMainContent`
    
## database

* Expression
    * todo
* getGraphFromRootURIs
    * tested indirectly via `npm run test-crawl`. Unit testing would be debattable

## Oracles

* ?

## Server

* index.js
    * Probably best tested alongside `client/` with Casper.js
* Make sure the server starts at all





    
    