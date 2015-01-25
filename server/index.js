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

var LoginScreen = React.createFactory(require('../client/components/LoginScreen'));
var TerritoiresScreen = React.createFactory(require('../client/components/TerritoiresScreen'));
var OraclesScreen = React.createFactory(require('../client/components/OraclesScreen'));

var googleCredentials = require('../config/google-credentials.json');

function serializeDocumentToHTML(doc){ return '<!doctype html>\n'+doc.documentElement.outerHTML; }


// Doesn't make sense to start the server if this file doesn't exist. *Sync is fine.
var indexHTMLStr = fs.readFileSync(resolve(__dirname, '../client/index.html'), {encoding: 'utf8'});

var PORT = 3333;

var oraclesInitData = require('./initOraclesData.json');
var oracleModules = Object.create(null);

var oraclesReadyP = Promise.all(oraclesInitData.map(function(o){
    var modulePath = resolve(__dirname, '../oracles', o.oracleNodeModuleName+'.js');
    
    // will throw if there is no corresponding module and that's on purpose
    oracleModules[o.oracleNodeModuleName] = require(modulePath);
    
    // check if entry with oracleNodeModuleName exists. If not, create it.
    // by oracleNodeModuleName because names may be localized in the future. Module names likely won't ever.
    return database.Oracles.findByOracleNodeModuleName(o.oracleNodeModuleName).then(function(result){
        if(!result)
            return database.Oracles.create(o);
        // else an entry exist, nothing to do.
    });
}));


oraclesReadyP.catch(function(err){
    console.error("oracles error", err);
    process.kill()
})

var app = express();
app.disable("x-powered-by");

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
    key: "s",
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

function renderDocumentWithData(doc, data, reactFactory){
    doc.querySelector('body').innerHTML = React.renderToString( reactFactory(data) );
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

            renderDocumentWithData(doc, initData, TerritoiresScreen);

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
    // TODO  this should 403 if the user doesn't own the territoire or something
    
    var territoireId = Number(req.params.id);
    var queryData = req.body;

    console.log('creating query', territoireId, queryData);
    queryData.belongs_to = territoireId;

    database.Queries.create(queryData).then(function(newQuery){
        res.status(201).send(newQuery);
        
        database.Oracles.findById(newQuery.oracle_id).then(function(oracle){
            console.log('oracle found', oracle.name, user.name, newQuery.q);
            
            if(oracle.needsCredentials){
                return database.OracleCredentials.findByUserAndOracleId(user.id, oracle.id).then(function(oracleCredentials){
                    console.log('oracle credentials', oracle.name, user.name, newQuery.q, oracleCredentials);
                    
                    // temporarily hardcoded. TODO generalize in the future
                    var oracleFunction = oracleModules[oracle.oracleNodeModuleName]({
                        "API key": oracleCredentials["API key"],
                        cx: oracleCredentials["cx"]
                    });
                    
                    return oracleFunction(newQuery.q).then(function(searchResults){
                        console.log('GCSE oracle results for', newQuery.q, searchResults.length);
                        return database.QueryResults.create({
                            query_id: newQuery.id,
                            results: searchResults,
                            created_at: new Date()
                        });
                    });
                }).catch(function(err){
                    console.error('oracling after credentials err', err);
                });
            }
            else{
                throw 'TODO';
            }
        }).catch(function(err){
            console.error('oracling err', err);
        });
        
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


app.delete('/query/:id', function(req, res){
    var user = serializedUsers.get(req.session.passport.user);
    var id = Number(req.params.id);
    console.log('deleting query', user.id, 'query id', id);

    database.Queries.delete(id).then(function(){
        res.status(204).send('');
    }).catch(function(err){
        res.status(500).send('database problem '+ err);
    }); 
});


app.get('/oracles', function(req, res){
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

            renderDocumentWithData(doc, initData, OraclesScreen);

            res.send( serializeDocumentToHTML(doc) );
        })
        .catch(function(err){ console.error('/oracles', err); });
    }
});


app.post('/oracle-credentials', function(req, res){
    var user = serializedUsers.get(req.session.passport.user);
    if(!user || !user.id){
        res.redirect('/');
    }
    else{
        var userId = user.id;
        
        var oracleCredentialsData = req.body;
        
        oracleCredentialsData.oracleId = Number(oracleCredentialsData.oracleId);
        oracleCredentialsData.userId = userId;
        
        console.log('updating oracle credentials', oracleCredentialsData);

        database.OracleCredentials.createOrUpdate(oracleCredentialsData).then(function(){
            res.status(200).send();
        }).catch(function(err){
            res.status(500).send('database problem '+ err);
        });
    }
});

app.get('/oracle-credentials', function(req, res){
    var user = serializedUsers.get(req.session.passport.user);
    if(!user || !user.id){
        res.redirect('/');
    }
    else{
        var userId = user.id;
        
        console.log('getting oracle credentials', userId);

        database.OracleCredentials.findByUserId(userId).then(function(oracleCredentials){
            res.status(200).send(oracleCredentials);
        }).catch(function(err){
            res.status(500).send('database problem '+ err);
        });
    }
});

app.get('/territoire-screen-data/:id', function(req, res){
    var user = serializedUsers.get(req.session.passport.user);
    var territoireId = Number(req.params.id);
    
    database.complexQueries.getTerritoireScreenData(territoireId).then(function(territoireData){
        res.status(200).send(territoireData);
    }).catch(function(err){
        res.status(500).send('database problem '+ err);
    });
})


var server = app.listen(PORT, function(){
    var host = server.address().address;
    var port = server.address().port;

    console.log('Listening at http://%s:%s', host, port);
});
