"use strict";

var Map = require('es6-map');
var Promise = require('es6-promise');

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




var resolve = require('path').resolve;
var fs = require('fs');

var express = require('express');
var session = require('express-session');
var compression = require('compression');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var React = require('react');


var makeDocument = require('./makeDocument.js');

var App = require('../client/components/App.js');

var googleCredentials = require('../config/google-credentials.json');

function serializeDocumentToHTML(doc){ return '<!doctype html>\n'+doc.documentElement.outerHTML; }

// Doesn't make sense to start the server if this file doesn't exist. *Sync is fine.
var indexHTMLStr = fs.readFileSync(resolve(__dirname, '../client/index.html'), {encoding: 'utf8'});


var PORT = 3333;

var app = express();


var serializedUsers = new Map();

passport.use(new GoogleStrategy({
    clientID: googleCredentials["CLIENT_ID"],
    clientSecret: googleCredentials["CLIENT_SECRET"],
    callbackURL: "http://localhost:3333/auth/google/callback"
}, function(accessToken, refreshToken, profile, done){
    var googleUser = profile._json
    
    var user = {
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        pictureURL: googleUser.picture
    };
    
    //console.log('google login', user);
    
    //User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return done(null, user);
    //});
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
var territoiresData = require('./territoires.json');

function renderDocumentWithData(doc, data){
    doc.querySelector('body').innerHTML = React.renderToString( App(data) );
    doc.querySelector('script#init-data').textContent = JSON.stringify(data);
}

app.get('/territoires', function(req, res){
    var user = serializedUsers.get(req.session.passport.user);
    
    console.log('/territoires', 'user', user);
    
    // Create a fresh document every time
    makeDocument(indexHTMLStr).then(function(doc){
        var initData = {
            currentUser: territoiresData
        };
        
        renderDocumentWithData(doc, initData);
        
        res.send( serializeDocumentToHTML(doc) );
    })
    .catch(function(err){ console.error('/territoires', err); });
});


var server = app.listen(PORT, function(){
    var host = server.address().address;
    var port = server.address().port;

    console.log('Listening at http://%s:%s', host, port);
});
