"use strict";

var React = require('react');

var DeleteButton = React.createFactory(require('./DeleteButton'));

/*

interface TerritoireFormProps{
    territoire: MyWITerritoire
    deleteTerritoire: (t: MyWITerritoire) => void
}


interface MyWITerritoire{
    id: MyWITerritoireId
    name: string
    description: string 
    queries: MyWIQuery[]
}

*/

module.exports = React.createClass({
    getInitialState: function(){
        return {};
    },
    
    render: function(){
        var props = this.props;
        
        var territoire = props.territoire || {};
        
        return React.DOM.div({className: 'TerritoireForm-react-component'}, [
            React.DOM.form({
                className: "table-layout",
                onSubmit: function(e){
                    e.preventDefault();

                    var formElement = e.target;

                    var formData = Object.create(null);
                    formData.name = formElement.querySelector('input[name="name"]').value;
                    formData.description = formElement.querySelector('textarea[name="description"]').value;

                    console.log('formData', formData);

                    props.onSubmit(formData);
                }
            }, [
                React.DOM.label({}, [
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
                ]),
                React.DOM.label({}, [
                    React.DOM.span({}, 'Description'),
                    React.DOM.textarea({
                        name: 'description',
                        cols: "50",
                        rows: "5",
                        defaultValue: territoire.description
                    })
                ]),
                React.DOM.button({
                    type: "submit"
                }, "ok")
            ]),
            props.territoire ? new DeleteButton({
                onDelete: function(){
                    props.deleteTerritoire(props.territoire);
                }
            }) : undefined
        ])
        
        
        
    }
});
