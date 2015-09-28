"use strict";

/*
    The "social impact" is a made-up formulæ that is meant to give an approximate idea of how important
    a webpage has been on various social networks.

    Feel free to criticize this formulæ, propose a new one, etc.
*/

module.exports = function(annotations){
    return (annotations.facebook_like || 0) + 10*(
        (annotations.twitter_share || 0) +
        (annotations.facebook_share || 0) +
        (annotations.linkedin_share || 0)
    )
};
