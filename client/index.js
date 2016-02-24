"use strict";

if(typeof HTMLElement.prototype.remove !== 'function')
    throw 'Add HTMLElement.prototype.remove polyfill';

var React = require('react');
var page = require('page');

var serverAPI = require('./serverAPI/index');

var LoginScreen = React.createFactory(require('./components/LoginScreen'));
var TerritoireListScreen = React.createFactory(require('./components/TerritoireListScreen'));
var NewTerritoireScreen = React.createFactory(require('./components/NewTerritoireScreen'));
var TerritoireViewScreen = React.createFactory(require('./components/TerritoireViewScreen'));

/*
    "all" data. Reference data/state to be used in UI components.
*/
var data;

function createTerritoire(territoireData){
    var temporaryTerritoire = Object.assign({queries: []}, territoireData);

    // add at the beginning of the array so it appears first
    data.user.territoires.unshift(temporaryTerritoire);

    // render new territoire list right now
    page('/territoires');

    return serverAPI.createTerritoire(territoireData).then(function(serverTerritoire){
        var index = data.user.territoires.findIndex(function(t){
            return t === temporaryTerritoire;
        });

        serverTerritoire.queries = serverTerritoire.queries || [];
        data.user.territoires[index] = serverTerritoire;

        // some element of the state.user.territoires array was mutated
        page('/territoires');

    }).catch(function(err){
        console.error('Territoire creation error', err);
    });
}


/*
    routes
*/
/*page({
    click: true,
    popstate: true
})*/
page("/", function(){
    var screenData = data;
            
    React.render(new LoginScreen(screenData), document.body);
});
page("/index.html", "/");

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

page("/territoires/new", function(){
    var screenData = {
        createTerritoire: createTerritoire,
        user: data.user,
        oracles: data.oracles
    };
    
    console.log('/territoires/new screenData', screenData, data); 

    React.render(new NewTerritoireScreen(screenData), document.body);
});


// Makes sure tags are a Set<string>
function massageTerritoireData(terrData){
    var annotations = terrData.resourceAnnotationByResourceId;
    
    Object.keys(annotations).forEach(function(id){
        var ann = annotations[id];
        ann.tags = new Set( ann.tags || [] );
    })
    
    return terrData;
}

page("/territoire/:id", function displayTerritoireViewScreen(context){
    var territoireId = context.params.id;
    var t = data.user.territoires.find(function(terr){
        return terr.id === territoireId;
    });
    // console.log('/territoire/:id', territoireId, data.user.territoires, t);
        
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
        var screenData = {
            refresh: refresh,
            territoire: terrViewData,
            user: data.user,
            oracles: data.oracles
        };

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
