"use strict";

module.exports = function MessageInConstruction(onMessageComplete){
    
    if(!this)
        return new MessageInConstruction(onMessageComplete)
    
    var self = this;
    
    var partialLengthBuffer;
    var currentMessageLength;

    var partialMessageContent;
    
    function accumulateLength(chunk){
        if(currentMessageLength)
            throw new Error('currentMessageLength already done');

        partialLengthBuffer = partialLengthBuffer ?
            Buffer.concat([partialLengthBuffer, chunk]) :
            chunk;
    }

    function accumulateContent(chunk){
        if(Array.isArray(partialMessageContent))
            partialMessageContent.push(chunk);
        else
            partialMessageContent = [chunk];
    }

    function accumulatedContentLength(){
        return partialMessageContent.reduce(function(acc, curr){
            return acc + curr.length;
        }, 0);
    }
    
    function buildFinalMessageAndCleanUp(){
        var finalMessage = Buffer.concat(partialMessageContent);
        currentMessageLength = undefined;
        partialLengthBuffer = undefined;
        
        self.completeMessage = finalMessage;
        return finalMessage;
    }

    this.appendChunk = function appendChunk(chunk){
        var contentFirstIndex = 0;
        
        if(!currentMessageLength){
            contentFirstIndex = partialLengthBuffer ? 4 - partialLengthBuffer.length : 4;
            accumulateLength(chunk.slice(0, contentFirstIndex));

            if(partialLengthBuffer.length === 4){
                currentMessageLength = partialLengthBuffer.readUInt32BE(0, 4);
                partialLengthBuffer = undefined;
            }
        }

        var contentLastIndex;
        // side effects may have changed the value
        if(currentMessageLength){
            contentLastIndex = partialMessageContent ?
                contentFirstIndex + currentMessageLength - partialMessageContent.length :
                contentFirstIndex + currentMessageLength;

            accumulateContent(chunk.slice(contentFirstIndex, contentLastIndex));
            
            if(accumulatedContentLength() === currentMessageLength){ // message complete
                onMessageComplete(buildFinalMessageAndCleanUp());

                var leftoverChunk = chunk.slice(contentLastIndex);
                if(leftoverChunk.length >= 1)
                    return leftoverChunk;
            }
        }
    };
    
}
