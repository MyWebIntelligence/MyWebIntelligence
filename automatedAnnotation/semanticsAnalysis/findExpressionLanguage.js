"use strict";

var langdetect = require('langdetect');

var htmlLangToESLang = {
    "en": "en",
    "en-us": "en",
    "en-gb": "en",
    
    "fr": "fr",
    "fr-fr": "fr"
};

module.exports = function(expression){
    var htmllang = (expression.html_lang || '').toLowerCase();
    
    if(htmllang !== '' && !htmlLangToESLang[htmllang]){
        console.warn('Unknown language', htmllang)
    }
    
    // Until proven otherwise, trust the declared language over the detected one
    return htmlLangToESLang[htmllang] || langdetect.detectOne(expression.main_text);
}
