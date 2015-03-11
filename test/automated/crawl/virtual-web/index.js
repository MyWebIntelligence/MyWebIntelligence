"use strict";

require('../../../../ES-mess');

var readFileSync = require('fs').readFileSync;
var resolve = require('path').resolve;

var express = require('express');
var app = express();

var makeDocument = require('../../../../common/makeDocument');

var baseHTMLStr = readFileSync(resolve(__dirname, './index.html'));

var webDescription = require('./a.web.json');

// answer for all requests
/*
    path
    * startsWith /end => page with no links

    URL query options:
    * status (200, 404, 403, 500...)
        => request should be answered with this status
    * redirect (301, 302, 307, 308)
        => request should be answered with this redirect status
    * location
        => where the request should go to when redirect


*/

app.use(function(req, res){
    var status = Number(req.query.status || req.query.redirect || 200);
    
    if(req.query.redirect){
        if(!req.query.location){
            res.status(400).send([
                'redirect', req.query.redirect, 'but no location parameter', req.originalUrl
            ].join(' '));
        }
        else{
            var to = decodeURI(req.query.location);
            //console.log('to', to);
            res.redirect(status, to);
        }
    }
    else{
        res.type('html');
        
        if(req.path.startsWith('/end/')){
            res.status(status).send(baseHTMLStr);
        }
        else{
            var links = webDescription[req.path];
            
            makeDocument(baseHTMLStr).then(function(doc){
                links.forEach(function(u){
                    var a = doc.createElement('a');
                    a.setAttribute('href', u);
                    a.textContent = u; // symbolically
                    doc.body.appendChild(a);
                });

                res.status(status).send('<!doctype html>\n'+doc.documentElement.outerHTML);
            })
        }
    }
       
});

// http://a.web/
var server = app.listen(80, "127.0.0.1", function (e) {
    if(e)
        console.error(e);
    
    var host = server.address().address
    var port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port)
});