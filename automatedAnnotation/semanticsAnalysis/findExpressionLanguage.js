"use strict";

var langdetect = require('langdetect');

var htmlLangToESLang = {
    "en-us": "en"
};

module.exports = function(expression){
    var htmllang = (expression.html_lang || '').toLowerCase();
    
    // Until proven otherwise, trust the declared language over the detected one
    return htmlLangToESLang[htmllang] || htmllang || langdetect.detectOne(expression.main_text);
}
