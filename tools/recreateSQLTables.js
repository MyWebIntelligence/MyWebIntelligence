"use strict";

require('../ES-mess');

var createTables = require('../database/management/createTables');
var dropAllTables = require('../database/management/dropAllTables');

console.log('Dropping and creating SQL tables', process.env.NODE_ENV);

dropAllTables()
    .then(createTables)
    .then(function(){
        console.log('success');
        process.exit();
    })
    .catch(function(e){
        console.error('failure', e, e.stack);
        process.exit();
    });
