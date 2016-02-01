"use strict";

var React = require('react');


module.exports = React.createClass({
    displayName: 'LoginBox',
    
    getInitialState: function() {
        return {
            waiting: false
        };
    },
    
    render: function() {
        
        return React.DOM.div({id: 'sectionConnexionBoxContentBox'},
            React.DOM.img({src: '/images/logo.png'}),
            React.DOM.div({id: 'sectionConnexionBoxContentBoxReseaux'},
                /*React.DOM.div(
                    {
                        id: 'sectionConnexionBoxContentBoxReseaux-facebook',
                        className: 'sectionConnexionBoxContentBoxReseaux'
                    },
                    React.DOM.i({className: 'fa fa-facebook'})
                ),*/
                React.DOM.a(
                    {
                        href: "/auth/google",
                        id: 'sectionConnexionBoxContentBoxReseauxGooglePlus',
                        className: 'sectionConnexionBoxContentBoxReseaux'
                    },
                    React.DOM.i({className: 'fa fa-google-plus'})
                )/*,
                React.DOM.div(
                    {
                        id: 'sectionConnexionBoxContentBoxReseauxTwitter',
                        className: 'sectionConnexionBoxContentBoxReseaux'
                    },
                    React.DOM.i({className: 'fa fa-twitter'})
                )*/
            )
            //React.DOM.form({id: 'sectionConnexionBoxContentBoxForm'})
        );      
    }
});
