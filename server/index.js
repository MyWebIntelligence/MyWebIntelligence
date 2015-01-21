"use strict";

var Map = require('es6-map');
var Promise = require('es6-promise').Promise;

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
if (!Object.assign) {
    Object.defineProperty(Object, "assign", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(target, firstSource) {
            "use strict";
            if (target === undefined || target === null)
                throw new TypeError("Cannot convert first argument to object");
            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) continue;
                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) to[nextKey] = nextSource[nextKey];
                }
            }
            return to;
        }
    });
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex#Polyfill
if (!Array.prototype.findIndex) {
    Array.prototype.findIndex = function(predicate) {
        if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return i;
            }
        }
        return -1;
    };
}

var resolve = require('path').resolve;
var fs = require('fs');

var express = require('express');
var session = require('express-session');
var compression = require('compression');
var bodyParser = require('body-parser');
var multer = require('multer'); 

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var React = require('react');


var makeDocument = require('./makeDocument.js');
var database = require('../database/index.js');

var App = React.createFactory(require('../client/components/App.js'));

var googleCredentials = require('../config/google-credentials.json');

function serializeDocumentToHTML(doc){ return '<!doctype html>\n'+doc.documentElement.outerHTML; }



// Doesn't make sense to start the server if this file doesn't exist. *Sync is fine.
var indexHTMLStr = fs.readFileSync(resolve(__dirname, '../client/index.html'), {encoding: 'utf8'});


var PORT = 3333;

var app = express();


app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data

var serializedUsers = new Map();

passport.use(new GoogleStrategy({
    clientID: googleCredentials["CLIENT_ID"],
    clientSecret: googleCredentials["CLIENT_SECRET"],
    callbackURL: "http://localhost:3333/auth/google/callback"
}, function(accessToken, refreshToken, profile, done){
    var googleUser = profile._json;

    function errFun(err){ done(err) }

    return database.Users.findByGoogleId(googleUser.id).then(function(user){
        if(user){
            console.log('existing user', user);
            done(null, user);
        }
        else{
            console.log('no corresponding user for google id', googleUser.id);

            return database.Users.create({
                name: googleUser.name,
                emails: [googleUser.email],
                google_id: googleUser.id,
                google_name: googleUser.name,
                google_pictureURL: googleUser.picture
            }).then(function(user){
                console.log('created new user', user);
                done(null, user);
            });
        }
    }).catch(errFun)
}));

passport.serializeUser(function(user, done) {
    serializedUsers.set(user.id, user);
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    done(null, serializedUsers.get(id));
});



// gzip/deflate outgoing responses
app.use(session({ 
    secret: 'olive wood amplifi jourbon',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(resolve(__dirname, '..', 'client')));

app.use(compression());


/*
    Authentication routes
*/
app.get('/auth/google', passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/userinfo.email']
}) );

app.get('/auth/google/callback', 
        passport.authenticate('google', { failureRedirect: '/' }),
        function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/territoires');
}
       );


/*
    Application routes
*/
//var territoiresData = require('./territoires.json');

function renderDocumentWithData(doc, data){
    doc.querySelector('body').innerHTML = React.renderToString( App(data) );
    doc.querySelector('script#init-data').textContent = JSON.stringify(data);
}

app.get('/territoires', function(req, res){
    var user = serializedUsers.get(req.session.passport.user);
    if(!user || !user.id){
        res.redirect('/');
    }
    else{
        var userInitDataP = database.complexQueries.getUserInitData(user.id);

        // Create a fresh document every time
        Promise.all([makeDocument(indexHTMLStr), userInitDataP]).then(function(result){
            var doc = result[0]
            var initData = result[1];

            renderDocumentWithData(doc, initData);

            res.send( serializeDocumentToHTML(doc) );
        })
        .catch(function(err){ console.error('/territoires', err); });
    }
});

app.post('/territoire', function(req, res){
    var user = serializedUsers.get(req.session.passport.user);
    var territoireData = req.body;
    territoireData.created_by = user.id;
    console.log('creating territoire', user.id, territoireData);

    database.Territoires.create(territoireData).then(function(newTerritoire){
        res.status(201).send(newTerritoire);
    }).catch(function(err){
        res.status(500).send('database problem '+ err);
    });

});

app.post('/territoire/:id', function(req, res){
    var user = serializedUsers.get(req.session.passport.user);
    var id = Number(req.params.id);
    var territoireData = req.body;
    territoireData.id = id; // preventive measure to force consistency between URL and body
    console.log('updating territoire', user.id, 'territoire', territoireData);

    database.Territoires.update(territoireData).then(function(newTerritoire){
        res.status(200).send(newTerritoire);
    }).catch(function(err){
        res.status(500).send('database problem '+ err);
    });

});

app.delete('/territoire/:id', function(req, res){
    var user = serializedUsers.get(req.session.passport.user);
    var id = Number(req.params.id);
    console.log('deleting territoire', user.id, 'territoire id', id);

    database.Territoires.delete(id).then(function(){
        res.status(204).send('');
    }).catch(function(err){
        res.status(500).send('database problem '+ err);
    }); 
});

// to create a query
app.post('/territoire/:id/query', function(req, res){
    var user = serializedUsers.get(req.session.passport.user);
    var territoireId = Number(req.params.id);
    var queryData = req.body;

    console.log('creating query', territoireId, queryData);
    queryData.belongs_to = territoireId;

    database.Queries.create(queryData).then(function(newQuery){
        res.status(201).send(newQuery);
    }).catch(function(err){
        res.status(500).send('database problem '+ err);
    });

});

// update query
app.post('/query/:id', function(req, res){
    var user = serializedUsers.get(req.session.passport.user);
    var id = Number(req.params.id);
    var queryData = req.body;
    queryData.id = id; // preventive measure to force consistency between URL and body
    console.log('updating query', user.id, 'query', queryData);

    database.Queries.update(queryData).then(function(newQuery){
        res.status(200).send(newQuery);
    }).catch(function(err){
        res.status(500).send('database problem '+ err);
    });

});



var server = app.listen(PORT, function(){
    var host = server.address().address;
    var port = server.address().port;

    console.log('Listening at http://%s:%s', host, port);
});
