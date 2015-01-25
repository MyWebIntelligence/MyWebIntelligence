"use strict";

var React = require('react');

var serverAPI = require('./serverAPI/index');

var LoginScreen = React.createFactory(require('./components/LoginScreen'));
var TerritoiresScreen = React.createFactory(require('./components/TerritoiresScreen'));
var OraclesScreen = React.createFactory(require('./components/OraclesScreen'));
var TerritoireViewScreen = React.createFactory(require('./components/TerritoireViewScreen'));

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


function moveToTerritoireViewScreen(t){
    console.log('moveToTerritoireViewScreen', t);
    history.pushState('', undefined, '/territoire/'+t.id);
    displayTerritoireViewScreen(t);
}

function displayTerritoireViewScreen(t){
    var screenData = {
        territoire: t,
        oracles: data.oracles
    };

    React.render(TerritoireViewScreen(screenData), document.body);
    
    serverAPI.getTerritoireViewData(t).then(function(data){
        React.render(TerritoireViewScreen(data), document.body);
    });
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
                moveToOracleScreen: moveToOraclesScreen,
                moveToTerritoireViewScreen: moveToTerritoireViewScreen
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