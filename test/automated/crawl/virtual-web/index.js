"use strict";

var readFileSync = require('fs').readFileSync;
var resolve = require('path').resolve;

var express = require('express');
var app = express();

var baseHTMLStr = readFileSync(resolve(__dirname, './index.html'));

// answer for all requests
/*
    URL query options:
    * status (200, 404, 403, 500...)
        => request should be answered with this status
    * redirect (301, 302, 307, 308)
        => request should be answered with this redirect status
    * location
        => where the request should go to when redirect
    * links
        => Array of URLs the page has links to

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
            res.redirect(req.query.redirect, decodeURI(req.query.location));
        }
    }
    else{
        res.status(status).send(baseHTMLStr);   
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