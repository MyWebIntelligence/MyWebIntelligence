"use strict";

require('../../ES-mess');

var semanticAnalysis = require('../../automatedAnnotation/semanticsAnalysis');

var r = {
    id: 25,
    expression_id: 2
};

var territoireId = 9876;

semanticAnalysis(r, territoireId); 