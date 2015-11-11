"use strict";

require('../../ES-mess')

var database = require('../../database');

var prepareResourceForTerritoire = require('../../automatedAnnotation/resourceCoreAnnotations/prepareResourceForTerritoire');

var territoireId = 76543;
var depth = 0;

database.Resources.create("http://www.lemonde.fr/pixels/article/2015/05/04/que-contient-la-loi-sur-le-renseignement_4627068_4408996.html")
.catch(function(err){
    console.error('database.Resources.create error', err, err.stack);
})
.then(function(resources){
    
    return prepareResourceForTerritoire(resources[0], territoireId, depth)
    .then(function(){
        console.log('Resource prepared');
    })
    .catch(function(err){
        console.error('PrepareResourceForTerritoire error', err, err.stack);
    })
    
})

/*
    Check :
    * resource is created
    * resourceAnnotation is created
    * expressionDomain is created
    * expressionDomainAnnotation is created
    * expressionDomainAnnotation contains potential audience

*/

