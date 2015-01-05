"use strict";

var express = require('express');
var app = express();
var resolve = require('path').resolve;

var PORT = 3333;
    
app.use(express.static(resolve(__dirname, '..', 'client')));

var server = app.listen(PORT, function(){

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port)

});
