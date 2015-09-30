"use strict";

var immutableMap = require('immutable').Map;

/*
    keys of this object will be used as annotations_task.type
*/
// TODO Eventually, add expressions here https://github.com/MyWebIntelligence/MyWebIntelligence/issues/159
module.exports = immutableMap({
    'prepare_resource': require('./prepareResourceForTerritoire')
})
