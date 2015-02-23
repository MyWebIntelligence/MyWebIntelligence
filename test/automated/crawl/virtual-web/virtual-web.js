"use strict";

var express = require('express')
var app = express()

app.get('/', function (req, res) {
    console.log('virtual web answering!');
    res.send('Hello World!')
})

var server = app.listen(80, "127.0.0.1", function (e) {
    if(e)
        console.error(e);
    
    var host = server.address().address
    var port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port)
});