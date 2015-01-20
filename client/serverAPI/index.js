"use strict";

module.exports = {
    createTerritoire: function(data){
        console.log('about to create territoire with data', data);
        
        return new Promise(function(resolve, reject){
            var xhr = new XMLHttpRequest();

            xhr.open('POST', '/territoire');
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            
            xhr.responseType = 'json'
            
            xhr.addEventListener('load', function(){
                if(xhr.status < 400)
                    resolve(xhr.response);
                else{
                    reject(new Error('HTTP error ' + xhr.status + ' ' + xhr.responseText));
                }
                
            });
            
            xhr.addEventListener('error', reject);
            
            xhr.send(JSON.stringify(data));
        });
    }
};