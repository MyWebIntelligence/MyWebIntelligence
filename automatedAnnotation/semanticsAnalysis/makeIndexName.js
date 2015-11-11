"use strict";

module.exports = function makeIndexName(territoireId, language){
    return ['mywi', 'territoire', territoireId, language].join('-');
}
