"use strict";

var MAX_EXCERPT_LENGTH = 300;

module.exports = function simplifyExpression(expression){
    return {
        title: expression.title,
        excerpt: (expression.meta_description && expression.meta_description.slice(0, MAX_EXCERPT_LENGTH))
                || (expression.main_text && expression.main_text.slice(0, MAX_EXCERPT_LENGTH))
    }
};
