"use strict";

var MYWI_EXPRESSION_DOCUMENT_TYPE = require('./MYWI_EXPRESSION_DOCUMENT_TYPE');
var FILLER_TOKEN = '_';

var stopwordsByLanguage = {
    en: [
        'the', 'a', 'as', 'to', 'of', 'and', 'in', 'that', 
        'or', 'is', 'us', 'by', 'be', 'for', 'on', 'it', 
        'not', 'an', 'can', 'some', 'from'
    ],
    fr: [
        'je', 'tu', 'il', 'le', 'la', 'les', 'et', 'de', 'sur',
        'à', 'a', 'pour', 'en', 'du', 'ou', 'un', 'une', 'des'
    ]
};

var shingleFilters = Object.freeze({
    small_shingles: {
        type: "shingle",
        min_shingle_size: 2,
        max_shingle_size: 2,
        output_unigrams: true,
        filler_token: FILLER_TOKEN
    },
    big_shingles: {
        type: "shingle",
        min_shingle_size: 3,
        max_shingle_size: 5,
        output_unigrams: false
    },
    // http://www.dahuatu.com/qey7l3dLmQ.html
    // This removes shingles containing at least one stop word
    "kill_fillers": {
        "type": "pattern_replace",
        "pattern": '.*'+FILLER_TOKEN+'.*',
        "replace": ""
    }
});


var analysisByLanguage = {
    "en": {
        "filter": Object.assign({
            "english_stop": {
                "type": "stop",
                "stopwords": stopwordsByLanguage['en']
            },
            "english_stemmer": {
                "type": "stemmer",
                "language": "english"
            },
            "english_possessive_stemmer": {
                "type": "stemmer",
                "language": "possessive_english"
            }
        }, shingleFilters),
        "analyzer": {
            "mywi_en_1_2": {
                "tokenizer": "standard",
                "filter": [
                    "english_possessive_stemmer",
                    "lowercase",
                    "english_stop",
                    //"english_keywords",
                    "english_stemmer",
                    "small_shingles",
                    "kill_fillers"
                ]
            },
            "mywi_en_3_5": {
                "tokenizer": "standard",
                "filter": [
                    "english_possessive_stemmer",
                    "lowercase",
                    //"english_keywords",
                    "english_stemmer",
                    "big_shingles"
                ]
            }
        }
    },
    
    "fr": {
        "filter": Object.assign({
            "french_elision": {
                "type": "elision",
                "articles": [
                    "l", "m", "t", "qu", "n", "s",
                    "j", "d", "c", "jusqu", "quoiqu",
                    "lorsqu", "puisqu"
                ]
            },
            "french_stop": {
                "type": "stop",
                "stopwords": stopwordsByLanguage['fr']
            },
            "french_stemmer": {
                "type": "stemmer",
                "language": "light_french"
            }
        }, shingleFilters),
        "analyzer": {
            "mywi_fr_1_2": {
                "tokenizer": "standard",
                "filter": [
                    "french_elision",
                    "lowercase",
                    "french_stop",
                    //"french_keywords",
                    "french_stemmer",
                    "small_shingles",
                    "kill_fillers"
                ]
            },
            "mywi_fr_3_5": {
                "tokenizer": "standard",
                "filter": [
                    "french_elision",
                    "lowercase",
                    //"french_keywords",
                    "french_stemmer",
                    "big_shingles"
                ]
            }
        }
        
    }
    
}


var expressionProperties = [
    'main_text', 
    'title', 
    'meta_description', 'meta_keywords',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'b', 'em', 'i'
];


module.exports = function(language){
    if(!analysisByLanguage[language])
        return undefined; // unsupported language
    
    var indexConfig = {
        settings: {
            number_of_shards : 2, // the default (5) is absurdly big, 2 may be too much as well?
            analysis: analysisByLanguage[language]
        },
        mappings: {}
    };
    
    var analyzer_1_2 = 'mywi_'+language+'_1_2';
    var analyzer_3_5 = 'mywi_'+language+'_3_5';
    
    indexConfig.mappings[MYWI_EXPRESSION_DOCUMENT_TYPE] = {
        properties: expressionProperties.reduce(function(acc, prop){
            acc[prop] = {
                "type": "string",
                "fields": {
                    small: {
                        type: 'string',
                        analyzer: analyzer_1_2
                    },
                    big: {
                        type: 'string',
                        analyzer: analyzer_3_5
                    }
                }
            }
            
            return acc;
        }, {})
    };
        
    return indexConfig;
}
