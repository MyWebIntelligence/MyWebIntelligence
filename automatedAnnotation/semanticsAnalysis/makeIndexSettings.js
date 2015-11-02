"use strict";

var MYWI_EXPRESSION_DOCUMENT_TYPE = require('./MYWI_EXPRESSION_DOCUMENT_TYPE');

var analysisByLanguage = {
    "en": {
        "filter": {
            "english_stop": {
                "type": "stop",
                "stopwords": "_english_"
            },
            /*"english_more_stem_stop": {
                "type": "stop",
                "stopwords": ["web", "pattern", "book", "we"]
            },*/
            /*"english_keywords": {
                "type": "keyword_marker",
                "keywords": []
            },*/
            "english_stemmer": {
                "type": "stemmer",
                "language": "english"
            },
            "english_possessive_stemmer": {
                "type": "stemmer",
                "language": "possessive_english"
            }
        },
        "analyzer": {
            "mywi_en": {
                "tokenizer": "standard",
                "filter": [
                    "english_possessive_stemmer",
                    "lowercase",
                    "english_stop",
                    //"english_keywords",
                    "english_stemmer"
                    //"english_more_stem_stop" // after stemmer so it applies to stemmed items
                  ]
            }
        }
    }
    
}


var expressionProperties = [
    'main_text', 
    'title', 'meta_description', 'meta_keywords', 'html_lang',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'b', 'em', 'i'
];


module.exports = function(language){
    if(!analysisByLanguage[language])
        return undefined; // unsupported language
    
    var settings = {
        analysis: analysisByLanguage[language],
        mappings: {}
    };
    
    var analyzer = "mywi_"+language;
    
    settings.mappings[MYWI_EXPRESSION_DOCUMENT_TYPE] = {
        properties: expressionProperties.reduce(function(acc, prop){
            acc[prop] = {
                "type": "string",
                "analyzer": analyzer
            }
            
            return acc;
        }, {})
    }
    
    return settings;
}

