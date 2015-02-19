"use strict";

/*
    Extending built-ins can be dangerous!
    Always add things prefixed with _. This prevents collision with future standard methods.
*/

// necessary because Promise.all of the Promise polyfill doesn't accept Sets as iterables.
Set.prototype._toArray = function(){
    var a = [];
    
    this.forEach(function(e){
        a.push(e);
    })
    
    return a;
}


Set.prototype._randomSubset = function(){
    
}