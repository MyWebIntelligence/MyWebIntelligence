"use strict";

if (!Array.prototype.find) {
    Array.prototype.find = function(predicate) {
        if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
}

var Promise = require('es6-promise').Promise;

var Users = require('./models/Users');
var Territoires = require('./models/Territoires');


module.exports = {
    Users: Users,
    Territoires: Territoires,
    complexQueries: {
        getUserInitData: function(userId){
            var userP = Users.findById(userId);
            var relevantTerritoiresP = Territoires.findByCreatedBy(userId);
            
            return Promise.all([userP, relevantTerritoiresP]).then(function(res){
                var user = res[0];
                var relevantTerritoires = res[1];
                
                // TODO : get queries
                
                user.territoires = relevantTerritoires;
                user.pictureURL = user.google_pictureURL;
                
                return {currentUser: user};
            });
        }
    }
};