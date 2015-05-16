"use strict";

require('../../../ES-mess');

process.env.NODE_ENV = "test";

var assert = assert = require('chai').assert;
require('chai-as-promised');

var db = require('../../../database/index.js');
var dropAllTables = require('../../../postgresDB/dropAllTables');
var createTables = require('../../../postgresDB/createTables');

var deleteAllResources = db.Resources.deleteAll.bind(db.Resources);

var url = 'https://www.npmjs.com/package/sql';

describe('Resources', function(){
    
    before(function(){
        return dropAllTables().then(createTables);
    });
    
    
    describe('create', function(){

        it('should create one resources', function(){
            return db.Resources.create( new Set([url]) )
                .then(function(resourceIds){
                    assert.isArray(resourceIds);
                    assert.equal(resourceIds.length, 1);
                    assert.equal(typeof resourceIds[0].id, "number");
                
                    return db.Resources.findByURL(url).then(function(r){
                        assert.strictEqual(r.id, resourceIds[0].id);
                        assert.strictEqual(r.url, url);
                    });
                });
                
        });

        after(deleteAllResources);
    });
})