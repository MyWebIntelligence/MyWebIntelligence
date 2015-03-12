# Oracles

In essence, Oracles are functions that take keywords are input and return a list of URLs that are supposed to be relevant for these keywords.

It's not the role of MyWebIntelligence to provide oracles. There are already too many of them in the web (search engines to begin with). Our role is to interface with them.
So, in practive, the function returns a promise to a list of URLs (maybe a stream even?). 
In practice also, this function cannot be called unless it has access to some credentials (and/or if an authentication dance occured beforehand). In pratice also, a search is more than just keywords. It can contain a time range, a language restricton, etc.

In conclusion, the signature for Oracles will be something like:

```js
function(authData){

    var authDanceOverP = authDance(authData);

    return function(keywords, options){
        return authDanceOverP.then(function(secondaryAuthData){ // secondaryAuthData happens in OAuth for instance 
        
            // askOracle return a Promise<URL[]>
            return askOracle(keywords, options, secondaryAuthData);
        })
    };
}
```

Over time, it is expected from oracles to mostly return fresh URLs.