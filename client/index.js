"use strict";

var React = require('react');
var App = React.createFactory(require('./components/App'));

if(typeof HTMLElement.prototype.remove !== 'function')
    throw 'Add HTMLElement.prototype.remove polyfill';

location.pathname

document.addEventListener('DOMContentLoaded', function(){
    var initDataElement = document.querySelector('script#init-data');
    
    var initData = {};
    
    if(initDataElement && initDataElement.textContent.length >= 2){
        initData = JSON.parse(initDataElement.textContent);
        initDataElement.remove();
    }
    
    React.render(App(initData), document.body);
});