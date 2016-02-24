"use strict";

var React = require('react');

var QueryForm = React.createFactory(require('./QueryForm'));
var getQueryFormData = require('../getQueryFormData');

function findValidationErrors(fileString, oracles){
    console.log('findValidationErrors', oracles);
    
    var territoireData;
    var errors = [];
    var warnings = [];
    
    try{
        territoireData = JSON.parse(fileString);
    }
    catch(e){
        errors.push(e);
        
        return {
            errors : errors
        }; 
    }
    
    if(territoireData.name === undefined)
        errors.push(new Error('Missing territoire.name'))
    if(territoireData.description === undefined)
        errors.push(new Error('Missing territoire.description'))
    
    var queries = territoireData.queries;
    if(Array.isArray(queries)){
        // make sure there is a corresponding oracle in this instance of MyWI
        territoireData.queries = queries.filter(function(q){
            var oracle = oracles.find(function(o){
                return o.oracle_node_module_name === q.oracle_node_module_name;
            });
            
            if(!oracle){
                warnings.push(new Error('No oracle named "'+q.oracle_node_module_name+'". Query "'+q.name+'" not imported'))
                return false;
            }
            
            q.oracle_id = oracle.id;
            
            return true;
        })
    }
        
    return {
        territoireData: territoireData,
        errors : errors.length >= 1 ? errors : undefined,
        warnings : warnings.length >= 1 ? warnings : undefined
    }; 
}

/*

interface TerritoireFormProps{
    territoire: MyWITerritoire
    deleteTerritoire: (t: MyWITerritoire) => void
    onSubmit(formData),
    oracles: MyWIOracle[],
    
    // Indicates whether the form is meant to be used for initial creation or just edition
    // At this time, it's only used for the purpose of display the import input[type="file"]
    initialCreation: boolean 
}

*/

module.exports = React.createClass({
    displayName: "TerritoireForm",
    
    getInitialState: function(){
        return {
            territoireImportFileData: undefined
        };
    },
    
    render: function(){
        //var self = this;
        var props = this.props;
        
        var territoire = props.territoire || {};
        
        return React.DOM.div({
                style: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start'
                }
            }, 
            // Territoire creation form
            React.DOM.form(
                {
                    id: 'sectionBodyCreateTerritory',
                    className: 'sectionBody on',
                    onSubmit: function(e){
                        e.preventDefault();

                        var formElement = e.target;

                        var territoireData = Object.create(null);
                        territoireData.name = formElement.querySelector('input[name="name"]').value;
                        territoireData.description = formElement.querySelector('textarea[name="description"]').value;

                        var queryData = getQueryFormData(formElement, props.oracles);

                        territoireData.queries = [queryData];

                        props.onSubmit(territoireData);
                    }
                },
                React.DOM.div({className: 'territoryFormLine'}, 
                    React.DOM.div({className: 'territoryFormLineLabel'}, 'Titre'),
                    React.DOM.div({className: 'territoryFormLineInput'},
                        React.DOM.input({
                            name: 'name',
                            type: 'text',
                            required: true,
                            /*
                                https://github.com/facebook/react/issues/2860
                                Giving up for now
                            */
                            //pattern: '\s*(\S+\s*)+', 
                            defaultValue: territoire.name
                        })
                    )
                ),
                React.DOM.div({className: 'territoryFormLine'}, 
                    React.DOM.div({className: 'territoryFormLineLabel'}, 'Description'),
                    React.DOM.div({className: 'territoryFormLineInput'},
                        React.DOM.textarea({
                            name: 'description',
                            rows: '5',
                            defaultValue: territoire.description
                        })
                    )
                ),
                new QueryForm({
                    oracles: props.oracles
                }),

                React.DOM.button({
                    className: 'territoryFormButton',
                    type: 'submit'
                }, "ok")
            ),
            // Territoire import input
            React.DOM.section(
                {
                    style: {
                        fontSize: '2.5em',
                        flex: 1,
                        
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center'
                    }
                },
                'Import territoire',
                React.DOM.i(
                    {
                        className: 'fa fa-upload',
                        style: {cursor: 'pointer', fontSize: '3.5em', textTransform: 'uppercase'},
                        onClick: function(e){
                            var target = e.target;
                            var input = target.querySelector('input[type="file"]');
                            console.log('upload', target, input)
                            input.click();
                        }
                    },
                    React.DOM.input({
                        type: 'file',
                        style: {display: 'none'},
                        onClick: function(e){
                            e.stopPropagation(); // prevent from being caught by parent <i>
                        },
                        onChange: function(e){
                            var file = e.target.files[0];
                            var reader = new FileReader();

                            reader.onload = function(ev) {
                                var fileContent = ev.target.result;

                                var res = findValidationErrors(fileContent, props.oracles);
                                var territoireData = res.territoireData;
                                var errors = res.errors;
                                var warnings = res.warnings;

                                if(Array.isArray(errors)){
                                    errors.forEach(function(err){
                                        console.error('File import validation error for file', file.name, err);
                                    })
                                }
                                if(Array.isArray(warnings)){
                                    warnings.forEach(function(w){
                                        console.warn('File import validation warning for file', file.name, w);
                                    })
                                }

                                console.log('territoireImportFileData', res);
                                
                                if(!errors || errors.length === 0){
                                    props.onSubmit(territoireData);
                                }
                            };

                            reader.readAsText(file);
                        }
                    })
                )
            )
        )
    }
});
