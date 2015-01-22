"use strict";

var React = require('react');

var serverAPI = require('./serverAPI/index');

var LoginScreen = React.createFactory(require('./components/LoginScreen'));
var TerritoiresScreen = React.createFactory(require('./components/TerritoiresScreen'));

if(typeof HTMLElement.prototype.remove !== 'function')
    throw 'Add HTMLElement.prototype.remove polyfill';

if(!Object.assign){
    throw 'add Object.assign polyfill';
}

if(!Array.prototype.findIndex){
    throw 'add Array.prototype.findIndex polyfill';
}


//location.pathname

document.addEventListener('DOMContentLoaded', function(){
    var initDataElement = document.querySelector('script#init-data');
    
    var initData = {};
    
    if(initDataElement && initDataElement.textContent.length >= 2){
        initData = JSON.parse(initDataElement.textContent);
        initDataElement.remove();
    }
    
    switch(location.pathname){
        case '/':
            React.render(LoginScreen(initData), document.body);
            break;
        case '/territoires': 
            initData.serverAPI = serverAPI;
            console.log('/territoires initData', initData);
            
            React.render(TerritoiresScreen(initData), document.body);
            break;
        case '/oracles': 
            throw 'TODO';
        default:
            console.error('Unknown pathname', location.pathname);
    }
    
    
    
});