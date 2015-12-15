# Oracles

In essence, oracles can be thought as functions that take keywords as input and return a list of URLs that are expected to be relevant for these keywords.
In details, different oracles have various options and some need authentication and/or an account to a service.

In the scope of MyWebIntelligence, it is only expected to interface with existing "oracle" services (search engines, etc.), not to create such services. We provide an implementation for a couple of them. Other oracles are welcome in the form of [pull requests](https://help.github.com/articles/using-pull-requests/).

An oracle function looks like:

```js
function(authData){

    var authDanceOverP = authDance(authData);

    return function(keywords, options){
        return authDanceOverP.then(function(secondaryAuthData){ // secondaryAuthData happens in OAuth for instance 
        
            // askOracle return a Promise<Set<URL>>
            return askOracle(keywords, options, secondaryAuthData);
        })
    };
}
```

## How to create an oracle

1) Add an entry in `oracleDescriptions.json`

| key          | type                              | semantics         |    
|--------------|-----------------------------------|-------------------|
| `name`                  | string                 | oracle name       |
| `oracleNodeModuleName`  | string | name of the module file in the `oracles` directory |
| `options`?              | Array of `{id, name, type}` objects. `type` can be `date range`, `number`, a `string[]` | oracle options  |
| `needsCredentials`      | boolean or `{name: type}` object | whether the oracle needs credentials and which |

````json
{
    "name": "Google Custom Search Engine",
    "oracleNodeModuleName": "GCSE",
    "options": [
        {
            "id": "date-range", 
            "name": "Date range",
            "type": "date range"
        },
        {
            "id": "max-results", 
            "name": "Max results",
            "default": 100,
            "min": 0,
            "step": 10,
            "type": "number"
        }
    ],
    "needsCredentials": {
        "API key": "text",
        "cx": "text"
    }
}

````

2) Create a module in the `oracles` directory with the declared `oracleNodeModuleName` as file name. Adjust signature based on whether the oracle needs credentials or not. See existing oracles for examples.

