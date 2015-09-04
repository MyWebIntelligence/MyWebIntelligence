"use strict";

if(typeof HTMLElement.prototype.remove !== 'function')
    throw 'Add HTMLElement.prototype.remove polyfill';

var React = require('react');
var page = require('page');

var serverAPI = require('./serverAPI/index');

var LoginScreen = React.createFactory(require('./components/LoginScreen'));
var TerritoireListScreen = React.createFactory(require('./components/TerritoireListScreen'));
var OraclesScreen = React.createFactory(require('./components/OraclesScreen'));
var TerritoireViewScreen = React.createFactory(require('./components/TerritoireViewScreen'));

/*
    "all" data. Reference data/state to be used in UI components.
*/
var data;


/*
    routes
*/
/*page({
    click: true,
    popstate: true
})*/
page("/", function(){
    var screenData = Object.assign(
        {
            oracleHref: '/oracles'
        },
        data
    );
            
    React.render(new LoginScreen(screenData), document.body);
});
page("/index.html", "/");

page("/oracles", function(){
    var screenData = Object.assign(
        {
            onOracleCredentialsChange: function onOracleCredentialsChange(formData){
                serverAPI.updateOracleCredentials(formData);
            }
        },
        data
    );

    serverAPI.getCurrentUserOraclesCredentials().then(function(credentials){
        var credentialsByOracleId = Object.create(null);
        
        credentials.forEach(function(c){
            credentialsByOracleId[c.oracleId] = c;
        });
        
        screenData.oracleCredentials = credentialsByOracleId;
        React.render(new OraclesScreen(screenData), document.body);
    });

    React.render(new OraclesScreen(screenData), document.body);
});

page("/territoires", function(){
    var screenData = Object.assign(
        {
            serverAPI : serverAPI
        },
        data
    );
    console.log('/territoires screenData', screenData, data);

    React.render(new TerritoireListScreen(screenData), document.body);
});


// Makes sure tags are a Set<string>
function massageTerritoireData(terrData){
    var annotations = terrData.annotationByResourceId;
    
    Object.keys(annotations).forEach(function(id){
        var ann = annotations[id];
        ann.tags = new Set( ann.tags || [] );
    })
    
    return terrData;
}

page("/territoire/:id", function displayTerritoireViewScreen(context){
    var territoireId = Number(context.params.id);
    var t = data.user.territoires.find(function(terr){
        return terr.id === territoireId;
    });
    // console.log('/territoire/:id', territoireId, data.user.territoires, t);
    
    var screenData = {};
    
    function refresh(){
        console.log('refresh');
        return serverAPI.getTerritoireViewData(t)
            .then(massageTerritoireData)
            .then(function(terrViewData){
                console.log('getTerritoireViewData', t, terrViewData);
                render(terrViewData)
            });
    }
    
    function render(terrViewData){
        screenData = Object.assign(
            {refresh: refresh},
            screenData,
            {territoire: terrViewData}
        );

        React.render(new TerritoireViewScreen(screenData), document.body);
    }
    
    
    // render right away even with super-partial data
    render(t);
    
    // ask for refresh right away to get useful data
    refresh();
});



document.addEventListener('DOMContentLoaded', function l(){
    document.removeEventListener('DOMContentLoaded', l);

    var initDataElement = document.querySelector('script#init-data');
    var initDataStr = initDataElement.textContent.trim();
    
    if(initDataElement && initDataStr.length >= 2){
        data = JSON.parse(initDataStr);
        initDataElement.remove();
    }
    
    page();
});
