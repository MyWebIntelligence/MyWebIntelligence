"use strict";

var React = require('react');

var serverAPI = require('./serverAPI/index');

var LoginScreen = React.createFactory(require('./components/LoginScreen'));
var TerritoireListScreen = React.createFactory(require('./components/TerritoireListScreen'));
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
        React.render(new OraclesScreen(screenData), document.body);
    });

    React.render(new OraclesScreen(screenData), document.body);
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

    React.render(new TerritoireViewScreen(screenData), document.body);
    
    serverAPI.getTerritoireViewData(t).then(function(terrViewData){
        console.log('getTerritoireViewData', t, terrViewData);
        React.render(new TerritoireViewScreen({
            territoire: terrViewData,
            oracles: data.oracles
        }), document.body);
    });
}


document.addEventListener('DOMContentLoaded', function(){
    var initDataElement = document.querySelector('script#init-data');
    var screenData;
    
    if(initDataElement && initDataElement.textContent.length >= 2){
        data = JSON.parse(initDataElement.textContent);
        initDataElement.remove();
    }
    
    switch(location.pathname){
        case '/':
            screenData = Object.assign({}, data);
            
            React.render(new LoginScreen(screenData), document.body);
            break;
        case '/territoires': 
            screenData = Object.assign({
                serverAPI : serverAPI,
                moveToOracleScreen: moveToOraclesScreen,
                moveToTerritoireViewScreen: moveToTerritoireViewScreen
            }, data);
            console.log('/territoires screenData', screenData);
            
            React.render(new TerritoireListScreen(screenData), document.body);
            break;
        case '/oracles': 
            displayOraclesScreen();
            break;
        default:
            console.error('Unknown pathname', location.pathname);
    }
    
});
