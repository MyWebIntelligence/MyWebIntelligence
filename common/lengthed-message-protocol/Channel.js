"use strict";

var util = require("util");
var events = require("events");

var MessageInConstruction = require('./MessageInConstruction');

/*
    Create a channel object from read+write stream.
    A channel is an object with a .send method and an event emitter emitting 'message' events.
    messages are sent as | length (4 bytes) | content (length bytes) |
*/

function Channel(readStream, writeStream){
    if(!writeStream)
        throw new TypeError('missing writeStream');
    if(!readStream)
        throw new TypeError('missing readStream');
    
    if(!this)
        return new Channel(readStream, writeStream)
    
    var self = this;
    
    function emitMessage(completeBuffer){
        self.emit('message', completeBuffer);
    }
    
    var currentMessageInConstruction = new MessageInConstruction(emitMessage);
    
    /*
        SENDING
        data can be a string or a buffer
    */
    this.send = function(data){        
        var sizeFragment = new Buffer(4);
        var strFragment = new Buffer(data);
                
        if(strFragment.length > Math.pow(2, 32) - 1)
            throw new RangeError('Message too long', strFragment.length);
            
        sizeFragment.writeUInt32BE(strFragment.length, 0, 4);
        
        var b = Buffer.concat([sizeFragment, strFragment]);
                
        writeStream.write(b);
    };
    
    function processChunk(chunk){
        var leftoverChunk = currentMessageInConstruction.appendChunk(chunk);
                    
        if(currentMessageInConstruction.completeMessage){
            currentMessageInConstruction = new MessageInConstruction(emitMessage);
            
            if(leftoverChunk)
                processChunk(leftoverChunk);
        }
    }

    readStream.on('data', function(chunk){
        processChunk(chunk);
    });
}

util.inherits(Channel, events.EventEmitter);

module.exports = Channel;
