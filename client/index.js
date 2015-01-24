"use strict";

var React = require('react');

var serverAPI = require('./serverAPI/index');

var LoginScreen = React.createFactory(require('./components/LoginScreen'));
var TerritoiresScreen = React.createFactory(require('./components/TerritoiresScreen'));
var OraclesScreen = React.createFactory(require('./components/OraclesScreen'));

if(typeof HTMLElement.prototype.remove !== 'function')
    throw 'Add HTMLElement.prototype.remove polyfill';

if(!Object.assign)
    throw 'add Object.assign polyfill';

if(!Array.prototype.findIndex)
    throw 'add Array.prototype.findIndex polyfill';


/*
    "all" data. Reference data/state to be used in UI components.
*/
var data = {};

function onOracleCredentialsChange(formData){
    serverAPI.updateOracleCredentials(formData);
}

function moveToOraclesScreen(){
    console.log('moveToOraclesScreen');
    history.pushState('', undefined, '/oracles');
    displayOraclesScreen();
}

function displayOraclesScreen(){
    var screenData = {
        user: data.currentUser,
        oracles: data.oracles,
        onOracleCredentialsChange: onOracleCredentialsChange
    };

    serverAPI.getCurrentUserOraclesCredentials().then(function(credentials){
        var credentialsByOracleId = Object.create(null);
        
        credentials.forEach(function(c){
            credentialsByOracleId[c.oracleId] = c;
        });
        
        screenData.oracleCredentials = credentialsByOracleId;
        React.render(OraclesScreen(screenData), document.body);
    });

    React.render(OraclesScreen(screenData), document.body);
}


document.addEventListener('DOMContentLoaded', function(){
    var initDataElement = document.querySelector('script#init-data');
    
    if(initDataElement && initDataElement.textContent.length >= 2){
        data = JSON.parse(initDataElement.textContent);
        initDataElement.remove();
    }
    
    switch(location.pathname){
        case '/':
            var screenData = Object.assign({}, data);
            
            React.render(LoginScreen(screenData), document.body);
            break;
        case '/territoires': 
            var screenData = Object.assign({
                serverAPI : serverAPI,
                moveToOracleScreen: moveToOraclesScreen
            }, data);
            console.log('/territoires screenData', screenData);
            
            React.render(TerritoiresScreen(screenData), document.body);
            break;
        case '/oracles': 
            displayOraclesScreen();
            break;
        default:
            console.error('Unknown pathname', location.pathname);
    }
    
    
    
});