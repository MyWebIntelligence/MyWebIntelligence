"use strict";

var assert = assert = require('chai').assert;


function test(str){
    // https://html.spec.whatwg.org/multipage/forms.html#the-pattern-attribute
    var regexp = /^(?:\s*(\S+\s*)+)$/; // /(\S+)+/gi;

    return !!str.match(regexp);
}

describe('"not-only-spaces" regexp', function(){
    
    [
        'a',
        'ab',
        ' a',
        'a ',
        ' a ',
        ' ab ',
        'ab uy',
        'é ç à'
    ].forEach(function(str){
        it('"'+str+'" should be true', function(){
            assert.isTrue(test(str), str);
        });
    });


    [
        '',
        ' ',
        '\n',
        '\t',
        '  ',
        ' \t',
        '\t '
    ].forEach(function(str){
        it('"'+str+'" should be false', function(){
            assert.isFalse(test(str), str);
        });
    });
    
});
