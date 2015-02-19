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


Set.prototype._randomSubset = function(size){
    if(size > this.size)
        throw new RangeError('size problem: '+this.size+ ' ' + size);
    
    var newSet = new Set();
    
    while(newSet.size < size){
        this.forEach(function(e){
            if(newSet.size < size && Math.random() < 0.5)
                newSet.add(e);
        });
    }
    
    return newSet;
}