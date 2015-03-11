"use strict";

// Strongly inspired by http://blip.tv/jsconf/jsconf2011-dan-webb-5938616

var SPACE = ' ';
var DOUBLE_QUOTE = '"';

function xmlEscape(s){
    return s.replace(/&/g, '&amp;')
        .replace(/"/g, "&quot;")
        .replace(/</g, "&gt;")
        .replace(/>/g, "&lt;");
}

function createElement(tagname, attributes, content){

    var attrString = Object.keys(attributes).length === 0 ? '' :
        SPACE + Object.keys(attributes).map(function(attr){
            return attr + '=' + DOUBLE_QUOTE + xmlEscape(String(attributes[attr])) + DOUBLE_QUOTE; // TODO: escape the attribute double quotes
        }).join(SPACE);

    // Self-closing element
    if(!content && content !== '')
        return '<' + tagname + attrString + '/>';

    // Element with content
    var startTag = '<' + tagname + attrString + '>';

    if(Array.isArray(content)){ // children
        content = content.join('\n');
    }
    else{ // textContent
        content = xmlEscape(String(content));
    }

    var endTag = '</' + tagname + '>';

    return startTag + content + endTag;
}



var DOMbuilder = {};

var ALLOWED_ELEMENTS = [
    'gexf', 'graph',
    'nodes', 'node',
    'edges', 'edge', 'attributes', 'attribute', 'default',
    'attvalues', 'attvalue'];



ALLOWED_ELEMENTS.forEach(function(e){
    DOMbuilder[e] = function(attributes, content){
        return createElement(e, attributes || {}, content);
    }
});

module.exports = DOMbuilder;
