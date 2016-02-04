"use strict";

module.exports = function (client) {

    return {
        createIndex: function (name, mapping) {
            return new Promise(function (resolve, reject) {
                client.indices.create({
                    index: name,
                    body: mapping
                }, function (err, res) {
                    if (err) {
                        reject(err);
                    } else resolve(res);
                })
            });
        },

        deleteIndex: function (name) {
            return new Promise(function (resolve, reject) {
                client.indices.delete({
                    index: name
                }, function (err, res) {
                    if (err) {
                        //console.log('deleteIndex err', err)
                        if (err.status === '404') {
                            // index does not exist. Whatev's, just means another one can be created with this name
                            resolve();
                        } else
                            reject(err);
                    } else
                        resolve(res);
                })
            })
        },

        indexDocument: function (indexName, typeName, doc, id) {
            return new Promise(function (resolve, reject) {
                client.index({
                    index: indexName,
                    type: typeName,
                    id: id,
                    body: doc
                }, function (error, res) {
                    if (error) reject(error);
                    else {
                        resolve(res);
                    }
                });
            })
        },

        refreshIndex: function (name) {
            return new Promise(function (resolve, reject) {
                client.indices.refresh({
                    index: name
                }, function (err, res) {
                    if (err) {
                        reject(err);
                    } else
                        resolve(res);
                })
            })
        },

        termvector: function (indexName, type, docId, fields) {
            //console.log('termvector', indexName, type, docId, fields)

            return new Promise(function (resolve, reject) {
                client.termvector({
                    index: indexName,
                    type: type,
                    id: docId,
                    fields: fields,
                    offsets: false,
                    positions: false,
                    //payloads: true, // for some yet unknown reason, payloads aren't returned. maybe because of stemming 
                    field_statistics: false
                }, function(err, res){
                    if(err)
                        reject(err);
                    else
                        resolve(res);
                })
            })

        }

    };

}
