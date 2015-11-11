"use strict";

var fs = require('fs');
var path = require('path');

var MYWI_EXPRESSION_DOCUMENT_TYPE = require('./MYWI_EXPRESSION_DOCUMENT_TYPE');
var FILLER_TOKEN = '_';

var STOPWORD_DIR = path.join(__dirname, 'stopwords');

var stopwordsByLanguage = {};

// *Sync ballet. On purpose.
fs.readdirSync(STOPWORD_DIR)
    .filter(function(f){ return f.endsWith('.list') })
    .forEach(function(f){
        var lang = f.slice(0, f.indexOf('.list'));
        var content = fs.readFileSync( path.join(STOPWORD_DIR, f), 'utf-8');
    
        var stopwords = content
            .split('\n')
            .map(function(word){ return word.trim() })
            .filter(function(word){ return !word.includes(' ') })
    
        stopwordsByLanguage[lang] = stopwords;
    });



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
        max_shingle_size: 4,
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
