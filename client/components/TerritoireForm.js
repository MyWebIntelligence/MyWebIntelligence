"use strict";

var React = require('react');

var DeleteButton = React.createFactory(require('./DeleteButton'));



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
            errors : errors.length >= 1 ? errors : undefined
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
                return o.oracleNodeModuleName === q.oracleNodeModuleName;
            });
            
            if(!oracle){
                warnings.push(new Error('No oracle named "'+q.oracleNodeModuleName+'". Query "'+q.name+'" not imported'))
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
    oracles: MyWIOracle[]
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
        var self = this;
        var props = this.props;
        
        var territoire = props.territoire || {};
        
        return React.DOM.div({className: 'TerritoireForm-react-component'},
            React.DOM.form(
                {
                    className: "",
                    onSubmit: function(e){
                        e.preventDefault();

                        var formElement = e.target;

                        var formData = Object.create(null);
                        formData.name = formElement.querySelector('input[name="name"]').value;
                        formData.description = formElement.querySelector('textarea[name="description"]').value;

                        console.log('formData', formData);

                        props.onSubmit(formData);
                    }
                },
                React.DOM.label({}, 
                    React.DOM.span({}, 'Name'),
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
                ),
                React.DOM.label({}, 
                    React.DOM.span({}, 'Description'),
                    React.DOM.textarea({
                        name: 'description',
                        cols: "30",
                        rows: "5",
                        defaultValue: territoire.description
                    })
                ),
                React.DOM.button({
                    type: "submit"
                }, "ok")
            ),
            React.DOM.form(
                {
                    className: "import",
                    onSubmit: function(e){
                        e.preventDefault();

                        console.log('self.state.territoireImportFileData', self.state)
                        
                        if(self.state.territoireImportFileData)
                            props.onSubmit(self.state.territoireImportFileData);
                        else
                            console.error('self.state.territoireImportFileData', self.state.territoireImportFileData)
                    }
                },
                React.DOM.label({}, 
                    React.DOM.span({}, 'Import territoire file'),
                    React.DOM.input({
                        name: 'name',
                        type: 'file',
                        required: true,
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
                                
                                self.setState({
                                    territoireImportFileData: !errors || errors.length === 0 ?
                                        territoireData :
                                        undefined
                                });
                            };

                            reader.readAsText(file);
                        }
                    })
                ),
                React.DOM.button({
                    type: "submit"
                }, "ok")
            ),
            props.territoire ? new DeleteButton({
                onDelete: function(){
                    props.deleteTerritoire(props.territoire);
                }
            }) : undefined
        )
        
        
        
    }
});
