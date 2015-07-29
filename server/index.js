"use strict";

require('../ES-mess');
//require('better-log').install();
process.title = "MyWI server";

var resolve = require('path').resolve;
var fs = require('fs');

var express = require('express');
var session = require('express-session');
var compression = require('compression');
var bodyParser = require('body-parser');
var multer = require('multer'); 

var csv = require('fast-csv');
var tld = require('tldjs')
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var React = require('react');
var serializeDocumentToHTML = require('jsdom').serializeDocument;

var makeDocument = require('../common/makeDocument');
var database = require('../database');
//var dropAllTables = require('../postgresDB/dropAllTables');
//var createTables = require('../postgresDB/createTables');
var onQueryCreated = require('./onQueryCreated');
var getGraphExpressions = require('../common/graph/getGraphExpressions');
var getTerritoireScreenData = require('../database/getTerritoireScreenData');


var TerritoireListScreen = React.createFactory(require('../client/components/TerritoireListScreen'));
var OraclesScreen = React.createFactory(require('../client/components/OraclesScreen'));
var TerritoireViewScreen = React.createFactory(require('../client/components/TerritoireViewScreen'));

// start tasks processors
require('../crawl');
require('../automatedAnnotation');


var googleCredentials = require('../config/google-credentials.json');

// if(process.env.NODE_ENV !== "production") // commented for now. TODO Find proper way to handle both prod & dev envs
    //dropAllTables().then(createTables);

database.AlexaRankCache.count()
    .then(function(count){
        console.log('Number of Alexa Rank cache entries', count);
    })
    .catch(function(err){
        console.error('Error trying to get AlexaRank count', err, err.stack);
    })




// Doesn't make sense to start the server if this file doesn't exist. *Sync is fine.
var indexHTMLStr = fs.readFileSync(resolve(__dirname, '../client/index.html'), {encoding: 'utf8'});

var PORT = 3333;


var app = express();
app.disable("x-powered-by");

app.use(bodyParser.json({limit: "2mb"})); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data

passport.use(new GoogleStrategy({
    clientID: googleCredentials["CLIENT_ID"],
    clientSecret: googleCredentials["CLIENT_SECRET"],
    callbackURL: googleCredentials["CALLBACK_URL"]
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
            }).then(function(u){
                console.log('created new user', u);
                done(null, u);
            });
        }
    }).catch(errFun)
}));

var serializedUsers = new Map/*<UserId, User>*/();

var HARDCODED_DEVELOPER_ID = 68451720;

if(process.env.NODE_ENV === 'development'){    
    database.Users.findById(HARDCODED_DEVELOPER_ID)
        .then(function(user){
            if(user){
                serializedUsers.set(HARDCODED_DEVELOPER_ID, user);
                console.log('hardcoding user', user);
            }
            else{
                throw new Error('No user with id '+HARDCODED_DEVELOPER_ID);
            }
        })
        .catch(function(error){
            console.error('Problem trying to hardcode user', HARDCODED_DEVELOPER_ID, process.env.NODE_ENV, error)
        })
}
    

passport.serializeUser(function(user, done) {
    console.log('serializeUser', user);
    
    serializedUsers.set(user.id, user);
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    console.log('deserializeUser', id);
    
    done(null, serializedUsers.get(id));
});

app.use(express.static(resolve(__dirname, '..', 'client')));
app.use('/sigma', express.static(resolve(__dirname, '..', 'node_modules', 'sigma', 'build')));

if(process.env.NODE_ENV !== 'development'){
    app.use(session({ 
        secret: 'olive wood amplifi jourbon',
        key: "s",
        resave: false,
        saveUninitialized: true
    }));

    app.use(passport.initialize());
    app.use(passport.session());
}

app.use(compression());

app.use(function(req, res, next){
    console.log('NODE_ENV dependent route', process.env.NODE_ENV)
    
    if(process.env.NODE_ENV === 'development'){
        req.session = {
            passport: {
                user: serializedUsers.get(HARDCODED_DEVELOPER_ID)
            }
        };
    }
    
    var user = req.session.passport.user;
    
    if((process.env.NODE_ENV === 'stable' || process.env.NODE_ENV === 'experimental') && (!user || !user.id)){
        console.log('redirect')
        res.redirect('/');
    }
    else{
        next();
    }
        
});





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



/***
    HTML routes
***/

function renderDocumentWithData(doc, data, reactFactory){
    doc.querySelector('body').innerHTML = React.renderToString( reactFactory(data) );
    doc.querySelector('script#init-data').textContent = JSON.stringify(data);
}

app.get('/territoires', function(req, res){
    console.log('/territoires', typeof req.session.passport.user)
    
    var user = serializedUsers.get(req.session.passport.user.id);
    var userInitDataP = database.complexQueries.getUserInitData(user.id);

    // Create a fresh document every time
    Promise.all([makeDocument(indexHTMLStr), userInitDataP]).then(function(result){
        var doc = result[0].document;
        var dispose = result[0].dispose;

        var initData = result[1];

        renderDocumentWithData(doc, initData, TerritoireListScreen);
        res.send( serializeDocumentToHTML(doc) );
        dispose();
    })
    .catch(function(err){ console.error('/territoires', err, err.stack); });   
});


app.get('/oracles', function(req, res){
    var user = serializedUsers.get(req.session.passport.user.id);
    var userInitDataP = database.complexQueries.getUserInitData(user.id);

    // Create a fresh document every time
    Promise.all([makeDocument(indexHTMLStr), userInitDataP]).then(function(result){
        var doc = result[0].document;
        var dispose = result[0].dispose;

        var initData = result[1];

        renderDocumentWithData(doc, initData, OraclesScreen);

        res.send( serializeDocumentToHTML(doc) );
        dispose();
    })
    .catch(function(err){ console.error('/oracles', err); });
});


app.get('/territoire/:id', function(req, res){
    var user = serializedUsers.get(req.session.passport.user.id);
    var territoireId = Number(req.params.id);
    
    var userInitDataP = database.complexQueries.getUserInitData(user.id);
    var territoireP = database.Territoires.findById(territoireId);

    // Create a fresh document every time
    Promise.all([makeDocument(indexHTMLStr), userInitDataP, territoireP])
        .then(function(result){
            var doc = result[0].document;
            var dispose = result[0].dispose;

            var initData = result[1];
            var territoire = result[2];

            renderDocumentWithData(doc, Object.assign(initData, {
                territoire: Object.assign({
                    queries: [],
                    graph: {
                        nodes: [],
                        edges: []
                    }
                }, territoire)
            }), TerritoireViewScreen);

            res.send( serializeDocumentToHTML(doc) );
            dispose();
        })
        .catch(function(err){
            console.error('/territoire/:id problem', territoireId, err, err.stack);
            res.status(500).send(['/territoire/:id problem', territoireId, err].join(' '));
        });

});




/***
    data/JSON routes
***/

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


app.get('/alexa-ranks', function(req, res){
    // console.log('/alexa-ranks', req.query.hostnames, req.query)
    
    var hostnames = new Set(JSON.parse(decodeURIComponent(req.query.hostnames)));
    
    var domains = new Set();
    var domainToHostnames = new Map();
    
    hostnames.forEach(function(h){
        var domain = tld.getDomain(h);
        
        domains.add(domain);
        
        var domainHostnames = domainToHostnames.get(domain);
        if(!domainHostnames){
            domainHostnames = new Set();
            domainToHostnames.set(domain, domainHostnames);
        }
        
        domainHostnames.add(h);
    });
    
    database.AlexaRankCache.findByDomains(domains)
        .then(function(arEntries){
            // console.log('Alexa ranks before sending', results)
        
            var results = [];
        
            arEntries.forEach(function(are){
                var domain = are.site_domain;
                
                domainToHostnames.get(domain).forEach(function(hostname){
                    results.push(Object.assign({}, are, {site_domain: hostname}))
                });
            });
        
            res.send(results);
        })
        .catch(function(err){
            res.status(500).send('database problem '+ err);
        });
    
});

/*
    Disable server-side exports since from now on exports will happen from the client side.
    Keeping the code in case for now
*/
/*
app.get('/territoire/:id/expressions.gexf', function(req, res){
    var user = serializedUsers.get(req.session.passport.user);
    var id = Number(req.params.id);
    console.log('expressions.gexf', user.id, 'territoire id', id);
    
    var territoireP = database.Territoires.findById(id);
    console.time('graph from db');
    var graphP = database.complexQueries.getTerritoireGraph(id);
    var expressionsByIdP = graphP.then(getGraphExpressions)
    
    Promise.all([territoireP, graphP, expressionsByIdP]).then(function(result){
        console.timeEnd('graph from db')
        var territoire = result[0];
        var abstractGraph = result[1];
        var expressionsById = result[2];
        
        var pageGraph = abstractGraphToPageGraph(abstractGraph, expressionsById);
        
        // convert the file to GEXF
        // send with proper content-type
        res.set('Content-Type', "application/gexf+xml");
        res.set('Content-disposition', 'attachment; filename="' + territoire.name+'-pages.gexf"');
        console.time('as gexf');
        res.status(200).send(pageGraph.exportAsGEXF());
        console.timeEnd('as gexf');
    }).catch(function(err){
        console.error('expressions.gexf error', err, err.stack)
        
        res.status(500).send('database problem '+ err);
    }); 
});

app.get('/territoire/:id/domains.gexf', function(req, res){
    var user = serializedUsers.get(req.session.passport.user);
    var id = Number(req.params.id);
    console.log('domains.gexf', user.id, 'territoire id', id);
    
    var territoireP = database.Territoires.findById(id);
    console.time('graph from db');
    
    var graphP = database.complexQueries.getTerritoireGraph(id);
    var expressionsByIdP = graphP.then(getGraphExpressions);

    var domainGraphP = Promise.all([graphP, expressionsByIdP])
        .then(function(results){
            return abstractGraphToPageGraph(results[0], results[1]);
        })
        .then(pageGraphToDomainGraph);
    
    Promise.all([territoireP, domainGraphP]).then(function(result){
        console.timeEnd('graph from db')
        var territoire = result[0];
        var graph = result[1];
        
        // convert the file to GEXF
        // send with proper content-type
        res.set('Content-Type', "application/gexf+xml");
        res.set('Content-disposition', 'attachment; filename="' + territoire.name+'-domains.gexf"');
        console.time('as gexf');
        res.status(200).send(graph.exportAsGEXF());
        console.timeEnd('as gexf');
    }).catch(function(err){
        console.error('expressions.gexf error', err, err.stack)
        
        res.status(500).send('database problem '+ err);
    }); 
});
*/

app.get('/territoire/:id/expressions.csv', function(req, res){
    var user = serializedUsers.get(req.session.passport.user);
    var id = Number(req.params.id);
    console.log('expressions.csv', user.id, 'territoire id', id);
    
    var territoireP = database.Territoires.findById(id);
    console.time('graph from db');
    var graphP = database.complexQueries.getTerritoireGraph(id);
    var expressionByIdP = graphP.then(getGraphExpressions);
    
    Promise.all([territoireP, expressionByIdP]).then(function(result){
        console.timeEnd('graph from db')
        var territoire = result[0];
        var expressionById = result[1];
        
        // convert the file to GEXF
        // send with proper content-type
        res.set('Content-Type', "text/csv");
        res.set('Content-disposition', 'attachment; filename="' + territoire.name+'-pages.csv"');
        
        res.status(200);
        
        var expressions = Object.keys(expressionById).map(function(exprId){
            var expression = expressionById[exprId];
            return {
                id: expression.id,
                url: expression.url,
                title: expression.title,
                core_content: expression.main_text,
                meta_description: expression.meta_description
            };
        });
        
        var csvStream = csv.write(
            expressions,
            {headers: true}
        );
        
        csvStream.pipe(res);
    }).catch(function(err){
        console.error('expressions.gexf error', err, err.stack)
        
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
        onQueryCreated(newQuery, user);
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

app.get('/territoire-view-data/:id', function(req, res){
    // var user = serializedUsers.get(req.session.passport.user.id);
    
    var territoireId = Number(req.params.id);
    
    getTerritoireScreenData(territoireId).then(function(territoireData){
        res.status(200).send(territoireData);
    }).catch(function(err){
        console.error('database problem', err, err.stack);
        res.status(500).send('database problem '+err);
    });
});



var server = app.listen(PORT, function(){
    var host = server.address().address;
    var port = server.address().port;

    console.log('Listening at http://%s:%s', host, port);
});

process.on('uncaughtException', function(e){
    console.error('uncaughtException', e, e.stack);
});
