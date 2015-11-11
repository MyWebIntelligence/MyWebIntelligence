This directory groups the various ways an expression is being analyzed.

## First round of analysis

For the first My Web Intelligence iteration, expressions will be stemmed. The purpose is to understand what an expression is talking about. Stemming and gathering frequencies is the first step we're taking in that direction.

We're using Elastic Search to perform the analysis since it's a very flexible and powerful language analysis framework (among other things and at least for our current needs).

### Elastic Search setup

My Web Intelligence expressions will be stored as ES documents of the following shape.

````json
{
    title: string,
    
    meta_description: string,
    
    meta_keywords: Array<string>,
    
    h1: Array<string>,
    h2: Array<string>,
    h3: Array<string>,
    h4: Array<string>,
    h5: Array<string>,
    h6: Array<string>,
    strong: Array<string>,
    b: Array<string>,
    em: Array<string>,
    i: Array<string>,
    
    text: string
}
````

For each territoire, there can be documents in different languages and it is currently assumed that an expression is mono-lingual. As a consequence, we'll be adopting an indexing strategy that is [one index per (territoire, language) pair](https://www.elastic.co/guide/en/elasticsearch/guide/current/one-lang-docs.html). They will be named as such: `MyWI-territoire-<territoireId>-<language>` This will allow territoire-wide queries via [multi-index queries](https://www.elastic.co/guide/en/elasticsearch/guide/current/multi-index-multi-type.html).

Language needs to be detected beforehand to decide which index to use. This is done via [langdetect](https://www.npmjs.com/package/langdetect).










