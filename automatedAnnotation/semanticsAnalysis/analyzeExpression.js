"use strict";

var client = require('./elasticsearch/client');
var es = require('./elasticsearch');
var findExpressionLanguage = require('./findExpressionLanguage');
var makeIndexConfig = require('./makeIndexConfig');
var makeIndexName = require('./makeIndexName');
var makeNMinus1Grams = require('./makeNMinus1Grams');

var ELASTICSEARCH_ANALYSIS_HOST = "elasticanalysis:9200";
var MYWI_EXPRESSION_DOCUMENT_TYPE = require('./MYWI_EXPRESSION_DOCUMENT_TYPE');


var esapiP = client(ELASTICSEARCH_ANALYSIS_HOST)
    .then(es)
    // at startup delete all previous indices so newer indices can be recreated with the new mappings
    .then(function(esapi){
        return esapi.deleteIndex('*')
        .then(function(){
            return esapi;
        })
    });


module.exports = function(expression, resourceId, territoireId){
    
    var expressionLanguage = findExpressionLanguage(expression);
    var indexName = makeIndexName(territoireId, expressionLanguage);
    var documentId = String(resourceId);
    var document = expression;
    
    //console.log('document', document);
    
    return esapiP
    .then(function(esapi){
        return esapi.createIndex(indexName, makeIndexConfig(expressionLanguage))
        .catch(function(err){
            if(err && err.message && err.message.includes('IndexAlreadyExistsException') && err.message.includes(indexName)){
                // index already exists, let it slip
                return;
            }
            else{
                console.error('createIndex error', err);
                throw err; // forward
            }
        })
        .then(function(){
            console.log('Index', indexName, 'created');
            return esapi.indexDocument(indexName, MYWI_EXPRESSION_DOCUMENT_TYPE, document, documentId)
        })
        .then(function(){
            //console.log('document indexed')
            return esapi.refreshIndex(indexName);
        })
        .then(function(){
            //console.log('Index refreshed');
            var docKeys = Object.keys(document);

            var smallFields = docKeys.map(function(k){ return k+'.small' });
            var bigFields = docKeys.map(function(k){ return k+'.big' });

            var fields = [].concat(smallFields).concat(bigFields);

            return esapi.termvector(indexName, MYWI_EXPRESSION_DOCUMENT_TYPE, documentId, fields);
        })
        .then(function(result){
            //console.log('result', result);

            var termvectors = result.term_vectors;

            var termFreqByField = Object.create(null);

            Object.keys(termvectors).forEach(function(nestedField){
                var termvector = termvectors[nestedField];

                var terms = Object.keys(termvector.terms);
                var field = nestedField.slice(0, nestedField.indexOf('.'));

                var termsWithFreq = terms
                    .filter(function(t){
                        if(t.length === 0)
                            return false;
                        
                        if(t.includes(' ')){
                            // n-gram must appear at least twice to be a thing at all
                            return termvector.terms[t].term_freq >= 2;
                        }
                        else{
                            // simple word in non-main content (title, h1, strong, etc.) are all accepted
                            return field !== 'main_text'
                        }
                    })
                    .reduce(function(acc, t){
                        acc[t] = termvector.terms[t].term_freq;
                        
                        return acc;
                    }, Object.create(null));
                
                var currentTermFreq = termFreqByField[field];

                if(currentTermFreq){
                    Object.keys(currentTermFreq).forEach(function(word){
                        termsWithFreq[word] = currentTermFreq[word]; 
                    });
                }

                termFreqByField[field] = termsWithFreq;
            });
            
            // in each field, remove occurences of words if they appear in n-grams
            Object.keys(termFreqByField).forEach(function(f){
                var termFreq = termFreqByField[f];
                
                // sort the terms so that 4-grams come before 3-grams before bi-grams before words
                // This makes the substraction (-=) below more accurate
                var maxGramSortedTerms = Object.keys(termFreq);
                maxGramSortedTerms.sort(function(t1, t2){
                    return t2.split(' ').length - t1.split(' ').length;
                })
                
                maxGramSortedTerms.forEach(function(term){                    
                    var nMinus1Grams = makeNMinus1Grams(term);
                    var ngramFreq = termFreq[term];

                    nMinus1Grams.forEach(function(nMinus1Gram){                        
                        // sometimes words in ngrams are not present as words (like stop words "Ville *de* Bordeaux")
                        if(typeof termFreq[nMinus1Gram] === "number"){
                            termFreq[nMinus1Gram] -= ngramFreq;
                        }
                    })
                    
                });
                
                var termFreqArray = Object.keys(termFreq)
                    .filter(function(w){ return termFreq[w] >= 1; })
                    .map(function(w){
                        return {
                            word: w,
                            freq: termFreq[w]
                        };
                    })
                
                termFreqArray.sort(function(tf1, tf2){
                    return tf2.freq - tf1.freq;
                });
                
                termFreqByField[f] = termFreqArray;
            });
            

            return termFreqByField;
        })
    })
}
