"use strict";

require('../ES-mess');

var createTables = require('../database/management/createTables');

console.log('Creating SQL Tables', process.env.NODE_ENV);

createTables()
    .then(function(){
        console.log('success');
        process.exit();
    })
    .catch(function(e){
        console.error('failure', e, e.stack);
        process.exit();
    });
