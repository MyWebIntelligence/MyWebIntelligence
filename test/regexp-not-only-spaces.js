function test(str){
    // https://html.spec.whatwg.org/multipage/forms.html#the-pattern-attribute
    var regexp = /^(?:\s*(\S+\s*)+)$/; // /(\S+)+/gi;
    
    return !!str.match(regexp);
}
    
var truthy = [
    'a',
    'ab',
    ' a',
    'a ',
    ' a ',
    ' ab ',
    'ab uy',
    'é ç à'
];

truthy.forEach(function(str){
    console.log(str);
    if(test(str) === false)
        throw str + ' should be truthy, but is falsy';
});

var falsy = [
    '',
    ' ',
    '\n',
    '\t',
    '  ',
    ' \t',
    '\t '
];


falsy.forEach(function(str){
    console.log(str);
    if(test(str) === true)
        throw '('+str+') should be falsy, but is truthy';
});

console.log('pass');