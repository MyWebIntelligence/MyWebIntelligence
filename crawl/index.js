"use strict";

require('../ES-mess');
require('./getExpression-scheduler');

module.exports = function(){
    // no-op for now. Eventually, this may wake processes up, maybe create some processes or something
    return Promise.resolve();
};
