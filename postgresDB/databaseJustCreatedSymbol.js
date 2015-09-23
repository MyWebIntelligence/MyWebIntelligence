"use strict";

/*
    This symbols can be used to determine whether an object has just been created 
    in the database or was acquired via a SELECT
*/

module.exports = '$$_databaseJustCreated_$$_'+(Math.random().toString(36).slice(2));
