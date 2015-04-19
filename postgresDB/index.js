"use strict";

var connectToDB = require('./connectToDB');
var createTables = require('./createTables');

var databaseP = connectToDB();
var databaseReadyP = databaseP
    .then(createTables)
    .then(function(){ return databaseP; });


function serializeArrayForDB(arr){
    return '{'+arr.map(function(v){
        if(Array.isArray(v))
            return "'"+ serializeArrayForDB(v) +"'";
        else
            return typeof v === 'string' ?
                '"'+ v +'"' :
                String(v);
    })+'}'
}

function serializeValueForDB(v){
    if(Array.isArray(v))
        return "'"+ serializeArrayForDB(v) +"'";
    else
        return typeof v === 'string' ?
            "'"+ v +"'" :
            String(v);
}


module.exports = {
    create: function(expressionData){
        //  (uri, mainHTML, mainText, title, \"references\", meta_description) VALUES ('http://a.b/c', '<span>a</span>', 'a', 'titre', '{\"http://a.b/d\", \"http://a.b/e\"}', 'desc');"
        return databaseReadyP.then(function(db){
            var keys = Object.keys(expressionData);
            var serializedKeys = keys.map(function(k){ return '"'+k+'"'; });
            
            var serializedValues = keys.map(function(k){
                var v = expressionData[k];
                return serializeValueForDB(v);
            });
            
            var query = [
                "INSERT INTO",
                "expressions",
                "("+serializedKeys.join(', ')+")",
                "VALUES",
                "("+serializedValues.join(', ')+")"
            ].join(' ') + ';';

            console.log('query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result);
                });
            });
        })
    },
    
    findByURIAndAliases: function(uris){
        return databaseReadyP.then(function(db){
            var uriDisjunction = uris.toJSON()
                .map(function(uri){
                    var serializedURIForDB = serializeValueForDB(uri);
                    
                    return [
                        serializedURIForDB,
                        ' = uri',
                        'OR',
                        serializedURIForDB,
                        '= ANY("aliases")'
                    ].join(' ');
                })
                .join(' OR ');
            
            
            var query = [
                "SELECT * FROM",
                "expressions",
                "WHERE",
                "("+uriDisjunction+")"
            ].join(' ') + ';';
            
            console.log('query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows);
                });
            });
        });
    },
    
    findByCanonicalURI: function(uri){
        return databaseReadyP.then(function(db){
            
            var query = [
                "SELECT * FROM",
                "expressions",
                "WHERE",
                "uri = "+serializeValueForDB(uri)
            ].join(' ') + ';';
            
            console.log('query', query);
            
            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result.rows[0]);
                });
            });
        });
    },
    
    update: function(expressionData){
        // UPDATE weather SET temp_lo = temp_lo+1, temp_hi = temp_lo+15, prcp = DEFAULT WHERE city = 'San Francisco' AND date = '2003-07-03';
        return databaseReadyP.then(function(db){
            var keys = Object.keys(expressionData);
            var serializedSETs = keys.map(function(k){
                if(k === 'id')
                    return undefined;

                var serK = '"'+k+'"'
                var v = expressionData[k];
                return serK + ' = ' + serializeValueForDB(v);
            }).filter(function(v){ return !!v; }).join(', ');

            var query = [
                "UPDATE",
                "expressions",
                "SET",
                serializedSETs,
                "WHERE",
                "id = "+expressionData.id
            ].join(' ') + ';';

            console.log('query', query);

            return new Promise(function(resolve, reject){
                db.query(query, function(err, result){
                    if(err) reject(err); else resolve(result);
                });
            });
        });
    }
    
    
};




























