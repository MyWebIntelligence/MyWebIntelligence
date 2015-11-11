"use strict";

var weightByField = Object.freeze({
    title: 20,
    meta_description: 20,
    h1: 15,
    h2: 10,
    h3: 5,
    meta_keywords: 3
});


module.exports = function(termFreqByField){
    var wordScores = Object.create(null);
    
    Object.keys(termFreqByField).forEach(function(f){
        var fieldWeight = weightByField[f] || 1;
        var termFreq = termFreqByField[f];
        
        termFreq.forEach(function(tf){
            var word = tf.word;
            var freq = tf.freq;
            
            var score = wordScores[word] || 0;
            score += fieldWeight*freq;
            
            wordScores[word] = score;
        });
    });
    
    var asArray = Object.keys(wordScores).map(function(word){
        return {
            word: word,
            score: wordScores[word]
        }
    });
    
    asArray.sort(function(ws1, ws2){
        return ws2.score - ws1.score;
    });
    
    return asArray;
}
