# Resource Annotations

## Automated

### Now

`automatedAnnotation/socialSignals/index.js` lists all possible automated annotations. Keys are used in database to differenciate the annotation type.

### Future

Elastic search will provide tags


## Manual

### Now 

Currently, only 5 types are supported:

| key          | type                              | semantics         |    
|--------------|-----------------------------------|-------------------|
| `approved`   | boolean                           | approved/rejected |
| `media_type` | enum                              | web page media type per @alakel's [list](https://github.com/MyWebIntelligence/MyWebIntelligence/issues/91#issuecomment-95236727) |
| `sentiment`  | `positive`, `negative`, `neutral`, null | For now, only `negative` is reflected in the UI and stored in the database |
| `favorite`   | boolean                           |     |
| `tags`       | string[]                          | free list of words |


### Future

People will be able to create their own annotations via something like github issue tags or google form.