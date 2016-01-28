"use strict";

var React = require('react');

/*

interface NavigationProps{
    activeScreen: string
}

*/

module.exports = React.createClass({
    displayName: 'Navigation',
    
    render: function() {
        //var props = this.props;
        
        return React.DOM.section({id: 'sectionNavigation'},
            React.DOM.div({id: 'sectionNavigationLogo'},
                React.DOM.img({src: 'images/logo.png'})
            ),
            React.DOM.a({id: 'sectionNavigationTerritory', className: 'on'},
                React.DOM.div({id: 'sectionNavigationTerritoryImg'},
                    React.DOM.img({src: 'images/territory.png'})
                ),
                React.DOM.div({id: 'sectionNavigationTerritoryLabel'}, 'Territoires'),
                React.DOM.div({className: 'clear'})
            ),
            React.DOM.div({id: 'sectionNavigationNewTerritory'},
                React.DOM.div({id: 'sectionNavigationTerritoryImg'},
                    React.DOM.img({src: 'images/newTerritory.png'})
                ),
                React.DOM.div({id: 'sectionNavigationTerritoryLabel'}, 'Create a new territoire'),
                React.DOM.div({className: 'clear'})
            )
            /*React.DOM.div({id: 'sectionNavigationNetworks'},
                //props.user.name
            )*/
        );
    }
});
