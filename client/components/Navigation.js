"use strict";

var React = require('react');


/*

interface NavigationProps{
    activeScreen: 'territoire-list' | 'new-territoire'
}

*/

module.exports = React.createClass({
    displayName: 'Navigation',
    
    render: function() {
        var props = this.props;
        
        return React.DOM.section({id: 'sectionNavigation'},
            React.DOM.div({id: 'sectionNavigationLogo'},
                React.DOM.img({src: '/images/logo.png'})
            ),
            React.DOM.a(
                {
                    href: '/territoires',
                    className: props.activeScreen === 'territoire-list' ? 'on' : undefined
                },
                React.DOM.div({id: 'sectionNavigationTerritoryLabel'}, 'Territoires'),
                React.DOM.div({id: 'sectionNavigationTerritoryImg'},
                    React.DOM.img({src: '/images/territory.png'})
                )
            ),
            React.DOM.a(
                {
                    href: '/territoires/new',
                    className: props.activeScreen === 'new-territoire' ? 'on' : undefined
                },
                React.DOM.div({id: 'sectionNavigationTerritoryLabel'}, 'Create a new territoire'),
                React.DOM.div({id: 'sectionNavigationTerritoryImg'},
                    React.DOM.img({src: '/images/newTerritory.png'})
                )
            )
                
            /*React.DOM.div({id: 'sectionNavigationNetworks'},
                //props.user.name
            )*/
        );
    }
});
