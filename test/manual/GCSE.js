"use strict";

require('../../ES-mess');

var gcseOracle = require('../../oracles/GCSE.js')( require('./gcse-credentials.json') );

var q = 'cup song';

// no history

var oracleResultNoHistoryP = gcseOracle(q);
oracleResultNoHistoryP.then(function(res){
    console.log('GCSE oracle result for', q, res.toJSON());
}).catch(console.error.bind(console, 'GCSE error'));


/*var oracleResultWithHistoryP = gcseOracle(q, {add24MonthHistory: true});
oracleResultWithHistoryP.then(function(res){
    console.log('GCSE oracle with history result for', q, res.toJSON());
}).catch(console.error.bind(console, 'GCSE error'));
*/