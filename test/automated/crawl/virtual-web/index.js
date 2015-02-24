"use strict";

var resolve = require('path').resolve;

var express = require('express');


var app = express();

app.use(express.static(resolve(__dirname, 'a.web')));

// http://a.web/
var server = app.listen(80, "127.0.0.1", function (e) {
    if(e)
        console.error(e);
    
    var host = server.address().address
    var port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port)
});