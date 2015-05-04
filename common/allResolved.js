"use strict";

/*
    Like Promise.all, but replaces rejected values by undefined
    In the presence of rejected values, this function resolves anyway. There is no circumstances where this
    function return a promise that rejects. Error are irrevocably swallowed.
*/
module.exports = function allResolved(promises){    
    if(!Array.isArray(promises))
        throw new TypeError('promises is not an array');
            
    var actuallyPromises = promises.map(function(v){
        return Promise.resolve(v);
    });
    var resolvedOrRejectedCount = 0;
    
    return Promise.all(actuallyPromises.map(function(p){        
        return p.then(function(res){
                resolvedOrRejectedCount++;
                return res;
            })
            .catch(function(){
                resolvedOrRejectedCount++;
                return undefined; // move to "resolve channel"
            });
    }));
    
};
