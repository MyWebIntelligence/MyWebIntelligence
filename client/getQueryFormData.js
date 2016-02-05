"use strict";

var cleanupURLs = require('../common/cleanupURLs');

module.exports = function(root, oracles){
    var queryData = Object.create(null);
    queryData.name = root.querySelector('.territoryFormQuery input[name="name"]').value.trim();
    queryData.q = root.querySelector('.territoryFormQuery input[name="q"]').value;
    queryData.oracle_id = root.querySelector('.territoryFormQuery select[name="oracle_id"]').value;

    var selectedOracle = oracles.find(function(o){
        return o.id === queryData.oracle_id
    });

    var oracleOptionElements = root.querySelectorAll('*[data-oracle-option-id]');
    var oracleOptions = Object.create(null);
    Array.from(oracleOptionElements).forEach(function(el){
        var oracleOptionId = el.getAttribute('data-oracle-option-id');
        var value;

        var type = selectedOracle.options.find(function(opt){
            return opt.id === oracleOptionId;
        }).type;

        switch(type){
            case 'list':
                value = cleanupURLs(el.value.split('\n'));
                break;
            case 'boolean':
                value = el.checked;
                break;
            case 'date range':
                value = {};
                var fromInput = el.querySelector('input[name="from"]');
                var from = fromInput.value;
                if(from)
                    value.from = from;

                var toInput = el.querySelector('input[name="to"]');
                var to = toInput.value;
                if(to)
                    value.to = to;

                break;
            case 'number':
                value = Number(el.value);
                break;
            default:
                // works for Array.isArray(type) (select/option)
                value = el.value;       
        }

        oracleOptions[oracleOptionId] = value;
    });

    queryData.oracle_options = JSON.stringify(oracleOptions);
    
    return queryData;
};
