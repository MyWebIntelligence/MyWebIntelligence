"use strict";

var langdetect = require('langdetect');

module.exports = function(expression){
    console.log('find lang', Object.keys(expression), expression.main_text && expression.main_text.length);
    // Until proven otherwise, trust the declared language over the detected one
    return expression.html_lang || langdetect.detectOne(expression.main_text);
}
